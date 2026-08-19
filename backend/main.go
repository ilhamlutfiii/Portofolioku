package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

type ProjectImage struct {
	ID        int    `json:"id"`
	ProjectID int    `json:"project_id"`
	ImageURL  string `json:"image_url"`
	Caption   string `json:"caption"`
}

type Project struct {
	ID          int            `json:"id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	TechStack   string         `json:"tech_stack"`
	Images      []ProjectImage `json:"images"`
	About       string         `json:"about"`
}

var db *sql.DB

func main() {
	var err error
	// Koneksi database (Render akan otomatis mengisi environment variable DATABASE_URL)
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgres://postgres:ilham871@localhost:5432/portofolio_db?sslmode=disable"
	}

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Println("Peringatan: Belum terhubung ke database:", err)
	} else {
		fmt.Println("Berhasil terhubung ke database!")
	}

	// 1. Pendaftaran Endpoint API
	http.HandleFunc("/api/admin/login", handleAdminLogin)

	http.HandleFunc("/api/projects", getProjects)
	http.HandleFunc("/api/projects/", getProjectByID)

	http.HandleFunc("/api/admin/projects", handleAdminProjects)
	http.HandleFunc("/api/admin/projects/", handleAdminProjectDetail)
	http.HandleFunc("/api/admin/project-images", handleAdminProjectImages)
	http.HandleFunc("/api/admin/project-images/", handleAdminProjectImageDetail)
	http.HandleFunc("/api/admin/upload", handleAdminUploadMedia)

	// 2. Pelayanan Folder Statis untuk Upload Media (Screenshots)
	http.Handle("/screenshots/", http.StripPrefix("/screenshots/", http.FileServer(http.Dir("./screenshots"))))

	// 3. Pelayanan Frontend React (Hasil build `dist` digabung ke dalam folder backend)
	fs := http.FileServer(http.Dir("./dist"))
	http.Handle("/", fs)

	// Fallback untuk React Router (agar halaman seperti /admin /login tidak 404 saat direfresh)
	http.HandleFunc("/admin", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./dist/index.html")
	})
	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./dist/index.html")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server Golang berjalan di http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleAdminLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method == "POST" {
		var creds struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}

		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var storedPassword string
		err := db.QueryRow("SELECT password FROM admin WHERE username = $1", creds.Username).Scan(&storedPassword)
		
		if err != nil || storedPassword != creds.Password {
			http.Error(w, "Username atau password salah", http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Login berhasil",
			"token":   "dummy-token-admin-123",
		})
	}
}

func handleAdminProjects(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		return
	}

	if r.Method == "POST" {
		var p struct {
			Title       string `json:"title"`
			Description string `json:"description"`
			TechStack   string `json:"tech_stack"`
			About       string `json:"about"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		query := `INSERT INTO projects (title, description, tech_stack, about) VALUES ($1, $2, $3, $4)`
		_, err := db.Exec(query, p.Title, p.Description, p.TechStack, p.About)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "Proyek berhasil ditambahkan"})
	}
}

func handleAdminProjectDetail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		return
	}

	idStr := strings.TrimPrefix(r.URL.Path, "/api/admin/projects/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID tidak valid", http.StatusBadRequest)
		return
	}

	if r.Method == "PUT" {
		var p struct {
			Title       string `json:"title"`
			Description string `json:"description"`
			TechStack   string `json:"tech_stack"`
			About       string `json:"about"`
		}

		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		query := `UPDATE projects SET title = $1, description = $2, tech_stack = $3, about = $4 WHERE id = $5`
		_, err = db.Exec(query, p.Title, p.Description, p.TechStack, p.About, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"message": "Proyek berhasil diperbarui"})
	} else if r.Method == "DELETE" {
		_, err = db.Exec("DELETE FROM projects WHERE id = $1", id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"message": "Proyek berhasil dihapus"})
	}
}

func handleAdminProjectImages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		return
	}

	if r.Method == "POST" {
		var img struct {
			ProjectID int    `json:"project_id"`
			ImageURL  string `json:"image_url"`
			Caption   string `json:"caption"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&img); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		query := `INSERT INTO project_images (project_id, image_url, caption) VALUES ($1, $2, $3)`
		_, err := db.Exec(query, img.ProjectID, img.ImageURL, img.Caption)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "Gambar galeri berhasil ditambahkan"})
	}
}

func handleAdminProjectImageDetail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		return
	}

	idStr := strings.TrimPrefix(r.URL.Path, "/api/admin/project-images/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID gambar tidak valid", http.StatusBadRequest)
		return
	}

	if r.Method == "PUT" {
		var img struct {
			ImageURL string `json:"image_url"`
			Caption  string `json:"caption"`
		}

		if err := json.NewDecoder(r.Body).Decode(&img); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		query := `UPDATE project_images SET image_url = $1, caption = $2 WHERE id = $3`
		_, err = db.Exec(query, img.ImageURL, img.Caption, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"message": "Gambar galeri berhasil diperbarui"})
	} else if r.Method == "DELETE" {
		_, err = db.Exec("DELETE FROM project_images WHERE id = $1", id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"message": "Gambar galeri berhasil dihapus"})
	}
}

func getProjects(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query("SELECT id, title, description, tech_stack, about FROM projects ORDER BY id ASC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var projects []Project

	for rows.Next() {
		var p Project
		if err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.TechStack, &p.About); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		p.Images = []ProjectImage{}
		imgRows, err := db.Query("SELECT id, project_id, image_url, caption FROM project_images WHERE project_id = $1", p.ID)
		if err == nil {
			defer imgRows.Close()
			for imgRows.Next() {
				var img ProjectImage
				if err := imgRows.Scan(&img.ID, &img.ProjectID, &img.ImageURL, &img.Caption); err == nil {
					p.Images = append(p.Images, img)
				}
			}
		}

		projects = append(projects, p)
	}

	json.NewEncoder(w).Encode(projects)
}

func getProjectByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	idStr := r.URL.Path[len("/api/projects/"):]

	var p Project
	err := db.QueryRow("SELECT id, title, description, tech_stack, about FROM projects WHERE id = $1", idStr).Scan(&p.ID, &p.Title, &p.Description, &p.TechStack, &p.About)
	if err != nil {
		http.Error(w, "Proyek tidak ditemukan", http.StatusNotFound)
		return
	}

	p.Images = []ProjectImage{}
	rows, err := db.Query("SELECT id, project_id, image_url, caption FROM project_images WHERE project_id = $1", p.ID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var img ProjectImage
			if err := rows.Scan(&img.ID, &img.ProjectID, &img.ImageURL, &img.Caption); err == nil {
				p.Images = append(p.Images, img)
			}
		}
	}

	json.NewEncoder(w).Encode(p)
}

func handleAdminUploadMedia(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		return
	}

	if r.Method == "POST" {
		err := r.ParseMultipartForm(50 << 20)
		if err != nil {
			http.Error(w, "Gagal parsing form (file terlalu besar?): "+err.Error(), http.StatusBadRequest)
			return
		}

		file, handler, err := r.FormFile("image")
		if err != nil {
			http.Error(w, "Gagal mengambil file: "+err.Error(), http.StatusBadRequest)
			return
		}
		defer file.Close()

		// PERBAIKAN: Folder tujuan diarahkan ke folder lokal "./screenshots/" di dalam backend
		uploadDir := "./screenshots/"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			http.Error(w, "Gagal membuat folder tujuan: "+err.Error(), http.StatusInternalServerError)
			return
		}

		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(handler.Filename))
		filename = strings.ReplaceAll(filename, " ", "_")
		dstPath := filepath.Join(uploadDir, filename)

		dst, err := os.Create(dstPath)
		if err != nil {
			http.Error(w, "Gagal membuat file di server: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "Gagal menyimpan file: "+err.Error(), http.StatusInternalServerError)
			return
		}

		webPath := "/screenshots/" + filename
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"image_url": webPath,
		})
	}
}
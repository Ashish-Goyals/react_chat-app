provider "docker" {}

resource "docker_image" "node_backend" {
  name         = "node:20"
  keep_locally = false
}

resource "docker_image" "react_frontend" {
  name         = "node:20"
  keep_locally = false
}

resource "docker_container" "backend" {
  name         = "chat-backend"
  image        = docker_image.node_backend.name
  working_dir  = "/app"

  volumes {
    host_path      = abspath("${path.module}/../Backend")
    container_path = "/app"
  }

  ports {
    internal = 8000
    external = 8000
  }

  command = ["sh", "-c", "npm install && npm run start"]
}

resource "docker_container" "frontend" {
  name         = "chat-frontend"
  image        = docker_image.react_frontend.name
  working_dir  = "/app"

  volumes {
    host_path      = abspath("${path.module}/../Frontend")
    container_path = "/app"
  }

  ports {
    internal = 5173
    external = 5173
  }
    command = ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0"]

 # command = ["sh", "-c", "npm install && npm run dev" -- --host]
}


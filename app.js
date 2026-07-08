require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./config/database");
const nodemailer = require("nodemailer");
const { engine } = require("express-handlebars");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const { title } = require("process");

const app = express();

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

app.use(fileUpload());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.engine(
  "handlebars",
  engine({
    partialsDir: path.join(__dirname, "views", "partials"),
    helpers: {
      isActive: function (currentPath, menuPath) {
        return currentPath === menuPath
          ? "nav-link active "
          : "nav-link text-white";
      },
      add: function (a, b) {
        return a + b;
      },
      subtract: function (a, b) {
        return a - b;
      },
      gt: function (a, b) {
        return a > b;
      },
      lt: function (a, b) {
        return a < b;
      },
      eq: function (a, b) {
        return a === b;
      },
    },
  }),
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use((req, res, next) => {
  res.locals.year = new Date().getFullYear();
  next();
});

app.get("/", (req, res, next) => {
  res.render("Home", { layout: false, title: "Home", currentPath: "/" });
});

app.get("/contact", (req, res, next) => {
  res.render("contact", {
    layout: false,
    title1: "contact",
    currentPath: "/contact",
  });
});

app.post("/send-message", async (req, res, next) => {
  const { name, email, message } = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER.trim(),
      pass: process.env.EMAIL_PASS.trim(),
    },
  });
  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: "abisatinfo@gmail.com",
    subject: "New contact form submission",
    html: `
        <p><strong>Name:</strong> ${name}</p>,
        <p><strong>Email:</strong> ${email}</p>,
        <p><strong>Message:</strong><br>${message}</p>
      `,
  };
  try {
    await transporter.sendMail(mailOptions);
    res.render("contact", {
      layout: false,
      successMessage: "✅Message sent successfully!",
      title1: "contact",
      currentPath: "/contact",
    });
  } catch (error) {
    console.error("error sending email:", error);
    res.render("contact", {
      layout: false,
      errorMessage: "❌Failed to send your message. please try again",
      title1: "contact",
      currentPath: "/contact",
    });
  }
});

app.get("/about", (req, res, next) => {
  res.render("about", {
    layout: false,
    title2: "About",
    currentPath: "/about",
  });
});

app.get("/admin/upload", (req, res, next) => {
  res.render("admin/upload", {
    layout: false,
  });
});

app.post("/admin/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.render("admin/upload", {
        message: "❌ No file uploaded!",
        layout: false,
      });
    }
    const { brand, model, file_type, description } = req.body;
    const file = req.files.file;

    if (!file_type) {
      return res.render("admin/upload", {
        message: "❌ Please select a file type (Software or Loader).",
        layout: false,
      });
    }
    const table = file_type === "Loader" ? "filesl" : "files";
    const savePath = path.join(uploadDir, file.name);
    const downloadUrl = `/uploads/${file.name}`;

    await file.mv(savePath);

    await db.execute(
      `INSERT INTO ${table} (brand, model, filename, file_type, download_url, description) VALUES (?, ?, ?, ?, ?, ?)`,
      [brand, model, file.name, file_type, downloadUrl, description],
    );

    res.render("admin/upload", {
      message: "✅ File uploaded successfully!",
      layout: false,
    });
  } catch (err) {
    console.error("Error during upload:", err);
    res.status(500).render("admin/upload", {
      message: "❌ Upload failed!",
      layout: false,
    });
  }
});

app.get("/software", async (req, res, next) => {
  const brand = req.query.brand;

  let query = "SELECT * FROM files";

  if (brand) {
    query = "SELECT * FROM files WHERE brand = ?";
  }

  try {
    const [files] = await db.query(query, [brand]);
    res.render("software", {
      files,
      brand,
      layout: false,
      title3: "Downloading File",
    });
  } catch (err) {
    console.error("Error fetching software:", err);
    res.status(500).send("Error loading software.");
  }
});

app.get("/download/software", async (req, res, next) => {
  const download_url = req.query.download_url;

  try {
    const [rows] = await db.query(
      "SELECT * FROM files WHERE download_url = ?",
      [download_url],
    );

    if (rows.length === 0) {
      return res.status(404).send("File not found!");
    }
    const file = rows[0];
    const filepath = path.join(uploadDir, file.filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).send("File not found on the server!");
    }
    res.download(filepath, file.filename, (err) => {
      if (err) {
        console.error("Error during download:", err);
        res.status(500).send("Error during download.");
      }
    });
  } catch (err) {
    console.error("Download error:", err);
    next(err);
  }
});

app.get("/loader", async (req, res, next) => {
  const brand = req.query.brand;

  let query = "SELECT * FROM filesl";

  if (brand) {
    query = "SELECT * FROM filesl WHERE brand = ?";
  }

  try {
    const [filesl] = await db.query(query, [brand]);
    res.render("loader", {
      filesl,
      brand,
      layout: false,
      title3: "Downloading File",
    });
  } catch (err) {
    console.error("Error fetching loader:", err);
    res.status(500).send("Error loading loader.");
  }
});

app.get("/download/loader", async (req, res, next) => {
  const download_url = req.query.download_url;

  try {
    const [rows] = await db.query(
      "SELECT * FROM filesl WHERE download_url = ?",
      [download_url],
    );

    if (rows.length === 0) {
      return res.status(404).send("File not found!");
    }
    const file = rows[0];
    const filepath = path.join(uploadDir, file.filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).send("File not found on the server!");
    }
    res.download(filepath, file.filename, (err) => {
      if (err) {
        console.error("Error during download:", err);
        res.status(500).send("Error during download.");
      }
    });
  } catch (err) {
    console.error("Download error:", err);
    next(err);
  }
});

app.get("/channel-sat", async (req, res, next) => {
  res.render("chsat", {
    layout: false,
    title4: "Channel & Sat",
    currentPath: "/channel-sat",
  });
});

app.get("/channel-sat/:name", async (req, res) => {
  const satName = req.params.name.toLowerCase();

  try {
    const [channels] = await db.query(
      "SELECT * FROM channels WHERE LOWER(satellite) = ?",
      [satName],
    );

    res.render("satellite", {
      satName: satName.charAt(0).toUpperCase() + satName.slice(1),
      channels,
      layout: false,
      currentPath: "/channel-sat",
      title5: `${
        satName.charAt(0).toUpperCase() + satName.slice(1)
      } Channel List`,
    });
  } catch (err) {
    console.error("Error fetching channels:", err);
    res.status(500).send("Error loading satellite channels.");
  }
});

app.use("/services", async (req, res, next) => {
  res.render("services", {
    layout: false,
    title6: "Our Services",
    currentPath: "/services",
  });
});

app.get("/admin/posts", async (req, res) => {
  try {
    const [posts] = await db.query(
      "SELECT id, title FROM posts ORDER BY created_at DESC LIMIT 5",
    );
    res.render("admin/admin-posts", {
      title7: "Admin Post Panel",
      posts,
      layout: false,
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("Failed to load posts.");
  }
});

app.post("/admin/posts", async (req, res) => {
  try {
    const { title, content } = req.body;

    let imageName = "";
    if (req.files && req.files.image) {
      const image = req.files.image;
      imageName = Date.now() + "_" + image.name;
      const uploadPath = path.join(__dirname, "uploads", imageName);

      await image.mv(uploadPath);
    }

    await db.query(
      "INSERT INTO posts (title, content, image) VALUES (?, ?, ?)",
      [title, content, imageName],
    );

    res.redirect("/admin/posts");
  } catch (err) {
    console.error("Error uploading post:", err);
    res.status(500).send("Failed to upload post");
  }
});

app.get("/posts", async (req, res) => {
  const postsPerPage = 6;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * postsPerPage;
  try {
    const [totalPosts] = await db.query("SELECT COUNT(*) AS count FROM posts");
    const totalPages = Math.ceil(totalPosts[0].count / postsPerPage);

    const [posts] = await db.query(
      "SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [postsPerPage, offset],
    );

    res.render("public-posts", {
      title8: "All Posts",
      posts,
      currentPage: page,
      totalPages: totalPages,
      errorMessage: null,
      currentPath: "/posts",
      layout: false,
    });
  } catch (err) {
    console.error(err);
    res.render("public-posts", {
      errorMessage: "Failed to load posts.",
      layout: false,
    });
  }
});

app.get("/admin/posts/edit/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const [post] = await db.query("SELECT * FROM posts WHERE id = ?", [postId]);
    if (post.length === 0) {
      return res.status(404).send("Post not found.");
    }
    res.render("admin/edit-post", {
      post: post[0],
      title9: "Edit Post",
      layout: false,
    });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).send("Error fetching post.");
  }
});

app.post("/admin/posts/edit/:id", async (req, res) => {
  const { title, content } = req.body;
  const postId = req.params.id;
  try {
    let imageName = "";
    if (req.files && req.files.image) {
      const image = req.files.image;
      imageName = Date.now() + "_" + image.name;
      const uploadPath = path.join(__dirname, "uploads", imageName);
      await image.mv(uploadPath);
    }

    await db.query(
      "UPDATE posts SET title = ?, content = ?, image = ? WHERE id = ?",
      [title, content, imageName, postId],
    );

    res.redirect("/admin/posts");
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).send("Failed to update post");
  }
});

app.post("/admin/posts/delete/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    await db.query("DELETE FROM posts WHERE id = ?", [postId]);
    res.redirect("/admin/posts");
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("Failed to delete post");
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

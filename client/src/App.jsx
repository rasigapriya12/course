
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/courses";

const emptyForm = {
  name: "",
  description: "",
  duration: "",
  level: "Beginner",
  instructor: "",
};

export default function App() {
  const [page, setPage] = useState("Home");
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load courses.");

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err.message || "Backend connection failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    `${course.name} ${course.instructor} ${course.level}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setPage("Add Course");
  }

  function editCourse(course) {
    setForm({
      name: course.name,
      description: course.description,
      duration: course.duration,
      level: course.level,
      instructor: course.instructor || "",
    });

    setEditingId(course._id);
    setPage("Add Course");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const url = editingId ? `${API}/${editingId}` : API;
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save course.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadCourses();
      setPage("Courses");
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    }
  }

  async function deleteCourse(id) {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete course.");
      }

      await loadCourses();
    } catch (err) {
      setError(err.message || "Could not delete course.");
    }
  }

  function navigate(item) {
    if (item === "Add Course") {
      openAddForm();
    } else {
      setPage(item);
      setError("");
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <button className="brand" onClick={() => navigate("Home")}>
          Course<span>Hub</span>
        </button>

        <nav>
          {["Home", "Courses", "Add Course", "About"].map((item) => (
            <button
              key={item}
              className={page === item ? "active" : ""}
              onClick={() => navigate(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <main className="container">
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        {page === "Home" && (
          <>
            <section className="hero">
              <span className="eyebrow">LEARN · BUILD · GROW</span>
              <h1>
                Find the right course.
                <br />
                <span>Build your future.</span>
              </h1>
              <p>
                Explore, organize, and manage your learning courses
                in one simple place.
              </p>

              <button onClick={() => navigate("Courses")}>
                Explore Courses →
              </button>
              <button className="secondary" onClick={openAddForm}>
                + Add a Course
              </button>
            </section>

            <section className="features">
              <article>
                <span>01</span>
                <h3>Explore courses</h3>
                <p>View course descriptions, instructors, and levels.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Manage easily</h3>
                <p>Create, update, search, and delete course records.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Track learning</h3>
                <p>Organize courses for different skill levels.</p>
              </article>
            </section>
          </>
        )}

        {page === "Courses" && (
          <section>
            <span className="eyebrow">COURSE DIRECTORY</span>
            <h1>All Courses</h1>
            <p>Browse and manage your learning catalogue.</p>

            <div className="toolbar">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search courses, instructor, or level..."
                aria-label="Search courses"
              />
              <button onClick={openAddForm}>+ Add Course</button>
            </div>

            {loading ? (
              <p>Loading courses...</p>
            ) : (
              <div className="course-grid">
                {filteredCourses.map((course) => (
                  <article className="course-card" key={course._id}>
                    <span className="level">{course.level}</span>
                    <h3>{course.name}</h3>
                    <p>{course.description}</p>
                    <p><strong>Duration:</strong> {course.duration}</p>
                    <p>
                      <strong>Instructor:</strong>{" "}
                      {course.instructor || "Not assigned"}
                    </p>
                    <div className="actions">
                      <button onClick={() => editCourse(course)}>
                        Edit
                      </button>
                      <button
                        className="danger"
                        onClick={() => deleteCourse(course._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}

                {filteredCourses.length === 0 && (
                  <p>No courses found. Add your first course!</p>
                )}
              </div>
            )}
          </section>
        )}

        {page === "Add Course" && (
          <section className="form-section">
            <span className="eyebrow">COURSE CATALOGUE</span>
            <h1>{editingId ? "Edit Course" : "Add a Course"}</h1>

            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Course name *</label>
              <input
                id="name"
                required
                maxLength={100}
                value={form.name}
                placeholder="Java Programming"
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                required
                maxLength={1000}
                value={form.description}
                placeholder="What will students learn?"
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <div className="form-row">
                <div>
                  <label htmlFor="duration">Duration *</label>
                  <input
                    id="duration"
                    required
                    value={form.duration}
                    placeholder="3 Months"
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="level">Level</label>
                  <select
                    id="level"
                    value={form.level}
                    onChange={(e) =>
                      setForm({ ...form, level: e.target.value })
                    }
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <label htmlFor="instructor">Instructor</label>
              <input
                id="instructor"
                value={form.instructor}
                placeholder="Instructor name (optional)"
                onChange={(e) =>
                  setForm({ ...form, instructor: e.target.value })
                }
              />

              <button type="submit">
                {editingId ? "Update Course" : "Create Course"}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => navigate("Courses")}
              >
                Cancel
              </button>
            </form>
          </section>
        )}

        {page === "About" && (
          <section className="about">
            <span className="eyebrow">ABOUT THE PROJECT</span>
            <h1>About CourseHub</h1>
            <p>
              CourseHub is a Course Management System developed using
              the MERN stack. It provides an easy way to add, view,
              search, update, and delete course details.
            </p>
            <p>
              Technologies used: React.js, Node.js, Express.js,
              and MongoDB.
            </p>
          </section>
        )}
      </main>

      <footer>
        <p>CourseHub · Course Management System</p>
      </footer>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  getServices,
  getCategories,
  createService,
  updateService,
  deleteService
} from "./services/serviceCatalog";
import {
  loginUser,
  saveSession,
  getStoredToken,
  getStoredUser,
  clearSession
} from "./services/authService";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  FiZap,
  FiCpu,
  FiTrendingUp,
  FiGitBranch,
  FiCheckCircle,
  FiArrowUpRight,
  FiSearch,
  FiLayers,
  FiSettings,
  FiMenu,
  FiX,
  FiInfo,
  FiPackage,
  FiMessageCircle,
  FiEye,
  FiEyeOff,
  FiLogOut,
  FiUserCheck
} from "react-icons/fi";
import "./App.css";

const emptyServiceForm = {
  title: "",
  shortDescription: "",
  fullDescription: "",
  startingPrice: "",
  deliveryTime: "",
  impactMetric: "",
  iconLabel: "",
  isFeatured: false,
  categoryId: ""
};

function App() {
  const [services, setServices] = useState([]);
  const [categoriesFromApi, setCategoriesFromApi] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleServices, setVisibleServices] = useState(6);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [loginLoading, setLoginLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [editingId, setEditingId] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [savingService, setSavingService] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const categoryButtons = [
    { label: "Todos", value: "all" },
    { label: "Automatización", value: "automation" },
    { label: "Inteligencia Artificial", value: "ai" },
    { label: "Análisis Predictivo", value: "predictive-analytics" },
    { label: "Transformación Digital", value: "digital-transformation" }
  ];

  const isAdmin = user?.role === "admin";
  const managementSectionId = isAdmin ? "admin-panel" : "user-panel";
  const acquiredServices = services.filter(
    (service) => service.isAcquired === 1 || service.isAcquired === true
  );

  useEffect(() => {
    loadServices(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadServices(category) {
    try {
      setLoading(true);
      setError("");
      setVisibleServices(6);

      const data = await getServices(category);
      setServices(data);
    } catch (err) {
      setError("No fue posible cargar el catálogo en este momento.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategoriesFromApi(data);
    } catch (err) {
      setAdminMessage("No fue posible cargar las categorías.");
    }
  }

  function handleCategoryChange(category) {
    setSelectedCategory(category);
  }

  function handleNavLinkClick() {
    setMenuOpen(false);
  }

  function handleRequestInfo(service) {
    if (!user) {
      setAuthMessage("Inicia sesión para solicitar información de este servicio.");

      setTimeout(() => {
        document.getElementById("portal")?.scrollIntoView({
          behavior: "smooth"
        });
      }, 100);

      return;
    }

    setInfoMessage(
      `Servicio seleccionado: ${service.title}. Puedes usar esta sección para dar seguimiento a tu solicitud de información.`
    );

    setTimeout(() => {
      document.getElementById("user-panel")?.scrollIntoView({
        behavior: "smooth"
      });
    }, 100);
  }

  function handleLoadMore() {
    setVisibleServices((prev) => prev + 3);
  }

  function handleLoginChange(event) {
    const { name, value } = event.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    try {
      setLoginLoading(true);
      setAuthMessage("");

      const data = await loginUser(loginForm);

      saveSession(data);
      setUser(data.user);
      setToken(data.token);

      setMenuOpen(false);
      setInfoMessage("");
      setLoginForm({ email: "", password: "" });
      setShowPassword(false);

      setAuthMessage(
        data.user.role === "admin"
          ? "Acceso administrativo habilitado."
          : "Sesión iniciada correctamente."
      );
    } catch (err) {
      setAuthMessage(err.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    setToken(null);
    setAuthMessage("Sesión cerrada correctamente.");
    setLoginForm({ email: "", password: "" });
    setShowPassword(false);
    setAdminMessage("");
    setInfoMessage("");
    setMenuOpen(false);
    setEditingId(null);
    setServiceForm(emptyServiceForm);
  }

  function handleServiceFormChange(event) {
    const { name, value, type, checked } = event.target;

    setServiceForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function resetServiceForm() {
    setServiceForm(emptyServiceForm);
    setEditingId(null);
  }

  function validateFrontendServiceForm() {
    if (
      !serviceForm.title ||
      !serviceForm.shortDescription ||
      !serviceForm.fullDescription ||
      !serviceForm.startingPrice ||
      !serviceForm.deliveryTime ||
      !serviceForm.impactMetric ||
      !serviceForm.iconLabel ||
      !serviceForm.categoryId
    ) {
      return "Completa todos los campos obligatorios.";
    }

    if (Number(serviceForm.startingPrice) <= 0) {
      return "El precio inicial debe ser mayor a 0.";
    }

    return "";
  }

  async function handleServiceSubmit(event) {
    event.preventDefault();

    if (!isAdmin) {
      setAdminMessage("No tienes permisos para modificar el catálogo.");
      return;
    }

    const validationMessage = validateFrontendServiceForm();

    if (validationMessage) {
      setAdminMessage(validationMessage);
      return;
    }

    const payload = {
      title: serviceForm.title,
      shortDescription: serviceForm.shortDescription,
      fullDescription: serviceForm.fullDescription,
      startingPrice: Number(serviceForm.startingPrice),
      deliveryTime: serviceForm.deliveryTime,
      impactMetric: serviceForm.impactMetric,
      iconLabel: serviceForm.iconLabel,
      isFeatured: serviceForm.isFeatured ? 1 : 0,
      categoryId: Number(serviceForm.categoryId)
    };

    try {
      setSavingService(true);
      setAdminMessage("");

      if (editingId) {
        await updateService(editingId, payload, token);
        setAdminMessage("Servicio actualizado correctamente.");
      } else {
        await createService(payload, token);
        setAdminMessage("Servicio creado correctamente.");
      }

      resetServiceForm();
      await loadServices(selectedCategory);
    } catch (err) {
      setAdminMessage(err.message);
    } finally {
      setSavingService(false);
    }
  }

  function handleEditService(service) {
    setEditingId(service.id);

    setServiceForm({
      title: service.title,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      startingPrice: service.startingPrice,
      deliveryTime: service.deliveryTime,
      impactMetric: service.impactMetric,
      iconLabel: service.iconLabel,
      isFeatured: service.isFeatured === 1 || service.isFeatured === true,
      categoryId: service.categoryId
    });

    setAdminMessage(`Editando: ${service.title}`);

    setTimeout(() => {
      document.getElementById("admin-panel")?.scrollIntoView({
        behavior: "smooth"
      });
    }, 100);
  }

  async function handleDeleteService(service) {
    if (!isAdmin) {
      setAdminMessage("No tienes permisos para eliminar servicios.");
      return;
    }

    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar "${service.title}"?`
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(service.id);
      setAdminMessage("");

      await deleteService(service.id, token);
      setAdminMessage("Servicio eliminado correctamente.");

      if (editingId === service.id) {
        resetServiceForm();
      }

      await loadServices(selectedCategory);
    } catch (err) {
      setAdminMessage(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  function isFeaturedService(service) {
    return service.isFeatured === 1 || service.isFeatured === true;
  }

  const selectedCategoryLabel =
    categoryButtons.find((category) => category.value === selectedCategory)?.label ||
    "Todos";

  const displayedServicesCount = Math.min(visibleServices, services.length);

  return (
    <main className="app">
      {/* SECTION: Header / Navigation */}
      <header className="topbar">
        <div className="container topbar__content">
          <a className="brand" href="#home">
            <span className="brand__mark">
              <span></span>
            </span>

            <div>
              <strong>NexaOps AI</strong>
              <small>Intelligent Business Services</small>
            </div>
          </a>

          <button
            className="nav-toggle"
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>

          <nav className={menuOpen ? "nav nav--open" : "nav"}>
            <a href="#home" onClick={handleNavLinkClick}>Inicio</a>
            <a href="#services" onClick={handleNavLinkClick}>Soluciones</a>
            <a href="#method" onClick={handleNavLinkClick}>Método</a>

            {user && (
              <a
                href={`#${managementSectionId}`}
                onClick={handleNavLinkClick}
              >
                Gestión
              </a>
            )}
          </nav>

          <div className="topbar__actions">
            {user ? (
              <div className="topbar-session" aria-label="Sesión activa">
                <span className={`role-pill role-pill--${user.role}`}>
                  <span className="role-pill__icon">
                    <FiUserCheck />
                  </span>
                  <span>{user.role === "admin" ? "Admin" : "Usuario"}</span>
                </span>

                <button className="btn btn-outline logout-button" onClick={handleLogout}>
                  <FiLogOut />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            ) : (
              <a
                className="btn btn-primary"
                href="#portal"
                onClick={handleNavLinkClick}
              >
                Iniciar sesión
              </a>
            )}
          </div>
        </div>
      </header>

      {/* SECTION: Hero / Main presentation */}
      <section className="hero" id="home">
        <div className="container hero__grid">
          <div className="hero__content">
            <span className="eyebrow">AI Operations Studio</span>

            <h1>
              Soluciones inteligentes para operar, automatizar y escalar negocios.
            </h1>

            <p>
              Integramos automatización, inteligencia artificial y análisis de datos
              para transformar procesos operativos en sistemas más ágiles, medibles
              y preparados para crecer.
            </p>

            <div className="hero__actions">
              <a className="btn btn-primary" href="#services">
                Explorar soluciones
              </a>

              <a className="btn btn-secondary" href="#method">
                Ver metodología
              </a>
            </div>
          </div>

          <aside className="hero-art" aria-hidden="true">
            <div className="hero-art__glow hero-art__glow--one"></div>
            <div className="hero-art__glow hero-art__glow--two"></div>

            <div className="art-orbit art-orbit--one"></div>
            <div className="art-orbit art-orbit--two"></div>

            <div className="art-frame">
              <div className="art-frame__top">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="art-frame__body">
                <div className="art-preview">
                  <div className="art-preview__block art-preview__block--main"></div>
                  <div className="art-preview__block"></div>
                  <div className="art-preview__block"></div>
                </div>

                <div className="art-stack">
                  <div className="art-mini-card">
                    <span></span>
                    <div>
                      <i></i>
                      <i></i>
                    </div>
                  </div>

                  <div className="art-mini-card">
                    <span></span>
                    <div>
                      <i></i>
                      <i></i>
                    </div>
                  </div>

                  <div className="art-mini-card">
                    <span></span>
                    <div>
                      <i></i>
                      <i></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="art-frame__bottom">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div className="art-floating art-floating--one">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="art-floating art-floating--two">
              <span></span>
              <span></span>
            </div>
          </aside>
        </div>
      </section>

      {/* SECTION: Work process */}
      <section className="value-strip">
        <div className="container value-strip__content">
          <div className="value-strip__intro">
            <span>Proceso de trabajo</span>
            <h2>Una ruta clara para convertir ideas en soluciones operativas.</h2>
          </div>

          <div className="value-strip__grid">
            <article className="process-card">
              <span className="process-card__number">01</span>

              <div className="process-card__icon">
                <FiSearch />
              </div>

              <h3>Diagnóstico</h3>

              <p>
                Analizamos procesos, necesidades y puntos de fricción para detectar
                oportunidades reales de mejora.
              </p>
            </article>

            <article className="process-card">
              <span className="process-card__number">02</span>

              <div className="process-card__icon">
                <FiLayers />
              </div>

              <h3>Diseño</h3>

              <p>
                Definimos la solución, el flujo de trabajo, la arquitectura y los
                indicadores que permitirán medir resultados.
              </p>
            </article>

            <article className="process-card">
              <span className="process-card__number">03</span>

              <div className="process-card__icon">
                <FiSettings />
              </div>

              <h3>Implementación</h3>

              <p>
                Integramos software, automatización y datos para entregar una solución
                funcional, escalable y medible.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* SECTION: Services catalog */}
      <section className="catalog-section" id="services">
        <div className="container">
          <div className="catalog-shell">
            <div className="catalog-heading">
              <div>
                <span>Soluciones disponibles</span>
                <h2>Servicios para modernizar operaciones.</h2>
              </div>

              <p>
                Explora el catálogo por área de solución. Cada servicio incluye
                alcance, tiempo de entrega e impacto esperado.
              </p>
            </div>

            <div className="catalog-layout">
              <aside className="catalog-sidebar">
                <span className="catalog-sidebar__label">Categorías</span>
                <h3>Filtrar catálogo</h3>
                <p>
                  Selecciona un área para enfocar las soluciones según la necesidad
                  del negocio.
                </p>

                <div className="catalog-filters">
                  {categoryButtons.map((category) => (
                    <button
                      type="button"
                      key={category.value}
                      className={
                        selectedCategory === category.value
                          ? "filter filter--active"
                          : "filter"
                      }
                      onClick={() => handleCategoryChange(category.value)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                <div className="catalog-summary">
                  <article>
                    <strong>{services.length}</strong>
                    <span>Servicios activos</span>
                  </article>

                  <article>
                    <strong>{displayedServicesCount}</strong>
                    <span>Mostrando ahora</span>
                  </article>
                </div>
              </aside>

              <div className="catalog-results">
                <div className="catalog-results__top">
                  <div>
                    <span>Categoría actual</span>
                    <h3>{selectedCategoryLabel}</h3>
                  </div>

                  <small>
                    {services.length} resultados encontrados
                  </small>
                </div>

                {loading && <p className="message">Cargando soluciones...</p>}
                {error && <p className="message message--error">{error}</p>}

                {!loading && !error && (
                  <>
                    <div className="services-grid">
                      {services.slice(0, visibleServices).map((service) => (
                        <article className="service-card" key={service.id}>
                          <div className="service-card__visual">
                            <span>{service.iconLabel}</span>

                            {isFeaturedService(service) && (
                              <strong>Recomendado</strong>
                            )}
                          </div>

                          <div className="service-card__body">
                            <div className="service-card__category">
                              {service.categoryName}
                            </div>

                            <h3>{service.title}</h3>
                            <p>{service.shortDescription}</p>
                          </div>

                          <div className="service-info service-info--single">
                            <div>
                              <span>Tiempo estimado</span>
                              <strong>{service.deliveryTime}</strong>
                            </div>
                          </div>

                          <div className="impact-box">
                            <span>Impacto esperado</span>
                            <strong>{service.impactMetric}</strong>
                          </div>

                          {isAdmin && (
                            <div className="card-actions">
                              <button onClick={() => handleEditService(service)}>
                                Editar
                              </button>

                              <button
                                className="danger"
                                onClick={() => handleDeleteService(service)}
                                disabled={deletingId === service.id}
                              >
                                {deletingId === service.id
                                  ? "Eliminando..."
                                  : "Eliminar"}
                              </button>
                            </div>
                          )}

                          {!isAdmin && (
                            <div className="card-actions">
                              {user ? (
                                <button
                                  className="info"
                                  type="button"
                                  onClick={() => handleRequestInfo(service)}
                                >
                                  Pedir información
                                </button>
                              ) : (
                                <a className="catalog-login-link" href="#portal">
                                  Iniciar sesión para informes
                                </a>
                              )}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>

                    {services.length === 0 && (
                      <div className="empty-state">
                        <h3>No hay soluciones disponibles</h3>
                        <p>Selecciona otra categoría o vuelve a intentarlo más tarde.</p>
                      </div>
                    )}

                    {visibleServices < services.length && (
                      <div className="load-more">
                        <button className="btn btn-primary" onClick={handleLoadMore}>
                          Ver más soluciones
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* SECTION: Method / Capabilities */}
      <section className="capabilities" id="method">
        <div className="container capabilities__grid">
          <article className="capabilities__intro">
            <span className="capabilities__eyebrow">Modelo de trabajo</span>

            <h2>Convertimos procesos complejos en soluciones medibles.</h2>

            <p>
              Diseñamos soluciones a partir del análisis operativo, la integración de
              datos y la automatización de tareas para mejorar la eficiencia del negocio.
            </p>

            <div className="capabilities__steps">
              <div>
                <strong>01</strong>
                <small>Analizar</small>
              </div>

              <div>
                <strong>02</strong>
                <small>Implementar</small>
              </div>

              <div>
                <strong>03</strong>
                <small>Medir</small>
              </div>
            </div>
          </article>

          <article className="capability-card">
            <div className="capability-card__header">
              <div className="capability-card__icon">
                <FiZap />
              </div>

              <span>01</span>
            </div>

            <h3>Automatización</h3>

            <p>
              Digitalización de procesos repetitivos para reducir tiempos, errores y
              dependencia de tareas manuales.
            </p>

            <ul>
              <li>
                <FiCheckCircle />
                Flujos operativos
              </li>
              <li>
                <FiCheckCircle />
                Reducción de errores
              </li>
              <li>
                <FiCheckCircle />
                Procesos más rápidos
              </li>
            </ul>

            <a href="#services">
              Ver soluciones
              <FiArrowUpRight />
            </a>
          </article>

          <article className="capability-card">
            <div className="capability-card__header">
              <div className="capability-card__icon">
                <FiCpu />
              </div>

              <span>02</span>
            </div>

            <h3>Inteligencia artificial</h3>

            <p>
              Aplicación de modelos inteligentes para apoyar decisiones, detectar
              patrones y optimizar operaciones.
            </p>

            <ul>
              <li>
                <FiCheckCircle />
                Asistentes inteligentes
              </li>
              <li>
                <FiCheckCircle />
                Análisis automatizado
              </li>
              <li>
                <FiCheckCircle />
                Soporte a decisiones
              </li>
            </ul>

            <a href="#services">
              Ver soluciones
              <FiArrowUpRight />
            </a>
          </article>

          <article className="capability-card">
            <div className="capability-card__header">
              <div className="capability-card__icon">
                <FiTrendingUp />
              </div>

              <span>03</span>
            </div>

            <h3>Analítica predictiva</h3>

            <p>
              Uso de indicadores, datos históricos y métricas clave para anticipar
              escenarios críticos del negocio.
            </p>

            <ul>
              <li>
                <FiCheckCircle />
                Indicadores clave
              </li>
              <li>
                <FiCheckCircle />
                Predicción de riesgos
              </li>
              <li>
                <FiCheckCircle />
                Reportes ejecutivos
              </li>
            </ul>

            <a href="#services">
              Ver soluciones
              <FiArrowUpRight />
            </a>
          </article>
        </div>

        <div className="container capabilities__flow">
          <div>
            <FiGitBranch />
            <span>Diagnóstico del proceso</span>
          </div>

          <div>
            <FiGitBranch />
            <span>Diseño de solución</span>
          </div>

          <div>
            <FiGitBranch />
            <span>Integración tecnológica</span>
          </div>

          <div>
            <FiGitBranch />
            <span>Medición de resultados</span>
          </div>
        </div>
      </section>

      {/* SECTION: Login portal */}
      <section className="portal" id="portal">
        <div className="container portal__grid">
          <div className="portal__info">
            <span className="eyebrow">Portal interno</span>

            <h2>Acceso seguro para consulta y administración.</h2>

            <p>
              Los usuarios pueden consultar el catálogo de servicios. El perfil
              administrativo cuenta con herramientas de gestión para mantener la
              información actualizada.
            </p>

            <div className="portal-points">
              <div>
                <strong>Consulta</strong>
                <span>Visualización de soluciones disponibles.</span>
              </div>

              <div>
                <strong>Gestión</strong>
                <span>Alta, edición y eliminación de registros.</span>
              </div>
            </div>
          </div>

          <form className="login-card" onSubmit={handleLoginSubmit} autoComplete="off">
            <div className="form-head">
              <span>Acceso</span>
              <h3>Iniciar sesión</h3>
            </div>

            <label>
              Correo electrónico
              <input
                type="email"
                name="email"
                value={loginForm.email}
                autoComplete="off"
                onChange={handleLoginChange}
                placeholder="correo@empresa.com"
                required
              />
            </label>

            <label>
              Contraseña
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <button className="btn btn-primary" type="submit">
              {loginLoading ? "Validando..." : "Entrar al portal"}
            </button>

            {user && (
              <div className="session-box">
                <span>Sesión activa</span>
                <strong>{user.name}</strong>
                <small>Rol: {user.role}</small>
              </div>
            )}

            {authMessage && <p className="form-message">{authMessage}</p>}
          </form>
        </div>
      </section>

      {/* SECTION: Management panel */}
      {user && (
        <section
          className="section container management-section"
          id={isAdmin ? "admin-panel" : "user-panel"}
        >
          {isAdmin ? (
            <>
              <div className="section-heading section-heading--split">
                <div>
                  <span>Gestión interna</span>
                  <h2>Administración del catálogo.</h2>
                </div>

                <p>
                  Mantén actualizada la información comercial de cada servicio,
                  sus tiempos, categoría e impacto esperado.
                </p>
              </div>

              <div className="admin-grid">
                <form className="admin-form" onSubmit={handleServiceSubmit}>
                  <div className="form-head">
                    <span>{editingId ? "Actualización" : "Nuevo servicio"}</span>
                    <h3>{editingId ? "Editar servicio" : "Registrar servicio"}</h3>
                  </div>

                  <div className="form-grid">
                    <label>
                      Título
                      <input
                        type="text"
                        name="title"
                        value={serviceForm.title}
                        onChange={handleServiceFormChange}
                        required
                      />
                    </label>

                    <label>
                      Categoría
                      <select
                        name="categoryId"
                        value={serviceForm.categoryId}
                        onChange={handleServiceFormChange}
                        required
                      >
                        <option value="">Selecciona una categoría</option>
                        {categoriesFromApi.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Precio interno
                      <input
                        type="number"
                        name="startingPrice"
                        value={serviceForm.startingPrice}
                        onChange={handleServiceFormChange}
                        min="1"
                        required
                      />
                    </label>

                    <label>
                      Tiempo de entrega
                      <input
                        type="text"
                        name="deliveryTime"
                        value={serviceForm.deliveryTime}
                        onChange={handleServiceFormChange}
                        required
                      />
                    </label>

                    <label>
                      Código visual
                      <input
                        type="text"
                        name="iconLabel"
                        value={serviceForm.iconLabel}
                        onChange={handleServiceFormChange}
                        maxLength="8"
                        required
                      />
                    </label>

                    <label>
                      Métrica de impacto
                      <input
                        type="text"
                        name="impactMetric"
                        value={serviceForm.impactMetric}
                        onChange={handleServiceFormChange}
                        required
                      />
                    </label>
                  </div>

                  <label>
                    Descripción corta
                    <textarea
                      name="shortDescription"
                      value={serviceForm.shortDescription}
                      onChange={handleServiceFormChange}
                      rows="3"
                      required
                    />
                  </label>

                  <label>
                    Descripción completa
                    <textarea
                      name="fullDescription"
                      value={serviceForm.fullDescription}
                      onChange={handleServiceFormChange}
                      rows="5"
                      required
                    />
                  </label>

                  <label className="checkbox-line">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={serviceForm.isFeatured}
                      onChange={handleServiceFormChange}
                    />
                    Marcar como recomendado
                  </label>

                  <div className="form-actions">
                    <button className="btn btn-primary" type="submit">
                      {savingService
                        ? "Guardando..."
                        : editingId
                          ? "Actualizar servicio"
                          : "Guardar servicio"}
                    </button>

                    {editingId && (
                      <button
                        className="btn btn-outline"
                        type="button"
                        onClick={resetServiceForm}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  {adminMessage && <p className="form-message">{adminMessage}</p>}
                </form>

                <div className="records-card">
                  <div className="records-head">
                    <div>
                      <span>Inventario</span>
                      <h3>Servicios activos</h3>
                    </div>

                    <strong>{services.length}</strong>
                  </div>

                  <div className="records-list">
                    {services.map((service) => (
                      <article className="record-item" key={service.id}>
                        <div>
                          <strong>{service.title}</strong>
                          <span>{service.categoryName}</span>
                        </div>

                        <small>{service.deliveryTime}</small>

                        <div className="record-actions">
                          <button onClick={() => handleEditService(service)}>
                            Editar
                          </button>

                          <button
                            className="danger"
                            onClick={() => handleDeleteService(service)}
                            disabled={deletingId === service.id}
                          >
                            {deletingId === service.id ? "..." : "Eliminar"}
                          </button>
                        </div>
                      </article>
                    ))}

                    {services.length === 0 && (
                      <div className="no-records">No hay servicios registrados.</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="section-heading section-heading--split">
                <div>
                  <span>Gestión de servicios</span>
                  <h2>Servicios contratados e información.</h2>
                </div>

                <p>
                  Revisa los servicios asociados a tu cuenta y solicita más
                  información sobre las soluciones del catálogo.
                </p>
              </div>

              <div className="user-dashboard">
                <article className="user-panel-card">
                  <div className="user-panel-card__icon">
                    <FiPackage />
                  </div>

                  <div>
                    <span>Mis servicios</span>
                    <h3>Servicios contratados</h3>
                    <p>
                      Aquí se mostrarán los servicios asociados a tu cuenta cuando
                      exista información registrada.
                    </p>
                  </div>

                  {acquiredServices.length > 0 ? (
                    <div className="contracted-list">
                      {acquiredServices.map((service) => (
                        <article key={service.id}>
                          <strong>{service.title}</strong>
                          <small>{service.categoryName}</small>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state empty-state--compact">
                      <h3>Sin servicios registrados</h3>
                      <p>
                        Todavía no tienes servicios adquiridos vinculados a esta
                        sesión.
                      </p>
                    </div>
                  )}
                </article>

                <article className="user-panel-card">
                  <div className="user-panel-card__icon">
                    <FiMessageCircle />
                  </div>

                  <div>
                    <span>Informes</span>
                    <h3>Solicitar información</h3>
                    <p>
                      Elige un servicio del catálogo y usa el botón “Pedir
                      información” para preparar tu solicitud.
                    </p>
                  </div>

                  {infoMessage ? (
                    <p className="form-message">{infoMessage}</p>
                  ) : (
                    <p className="user-panel-note">
                      No hay solicitudes seleccionadas por el momento.
                    </p>
                  )}

                  <a className="btn btn-primary" href="#services">
                    Ver catálogo
                  </a>
                </article>

                <article className="user-panel-card user-panel-card--highlight">
                  <div className="user-panel-card__icon">
                    <FiInfo />
                  </div>

                  <div>
                    <span>Seguimiento</span>
                    <h3>Próximos pasos</h3>
                    <p>
                      Una vez seleccionada una solución, el equipo podrá revisar
                      el alcance, validar necesidades y definir el flujo de
                      atención.
                    </p>
                  </div>
                </article>
              </div>
            </>
          )}
        </section>
      )}

      {/* SECTION: Footer */}
      {/* SECTION: Footer */}
      <footer className="footer" id="contact">
        <div className="container footer__grid">
          <div className="footer__brand">
            <a className="footer-logo" href="#home">
              <span className="footer-logo__mark">
                <span></span>
              </span>

              <div>
                <strong>NexaOps AI Services</strong>
                <small>Automation · Intelligence · Operations</small>
              </div>
            </a>

            <p>
              Plataforma enfocada en soluciones digitales, automatización e inteligencia
              artificial para mejorar procesos operativos y apoyar la toma de decisiones.
            </p>
          </div>

          <div className="footer__services">
            <h3>Nuestros servicios</h3>

            <div className="footer-services__list">
              <span>Automatización de procesos</span>
              <span>Inteligencia Artificial</span>
              <span>Análisis de datos</span>
              <span>Dashboards ejecutivos</span>
              <span>Integraciones API</span>
              <span>Desarrollo de software</span>
              <span>Bases de datos</span>
              <span>Monitoreo operativo</span>
              <span>Transformación digital</span>
              <span>Optimización de servicios</span>
            </div>
          </div>

          <div className="footer__social">
            <div className="footer-contact-card">
              <h3>Contáctanos</h3>
              <p>Conecta con nuestro equipo para conocer más sobre las soluciones disponibles.</p>
              <a className="footer-contact-btn" href="#portal">
                Ir al portal
              </a>
            </div>

            <div className="footer-socials">
              <h4>Síguenos en redes</h4>

              <div className="social-icons">
                <a href="#" aria-label="Facebook" className="social-icon">
                  <FaFacebookF />
                </a>

                <a href="#" aria-label="LinkedIn" className="social-icon">
                  <FaLinkedinIn />
                </a>

                <a href="#" aria-label="Instagram" className="social-icon">
                  <FaInstagram />
                </a>

                <a href="#" aria-label="YouTube" className="social-icon">
                  <FaYoutube />
                </a>

                <a href="#" aria-label="X" className="social-icon">
                  <FaXTwitter />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container footer__bottom">
          <span>© 2026 NexaOps AI Services</span>
          <span>Soluciones digitales para operaciones inteligentes</span>
        </div>
      </footer>
    </main>
  );
}

export default App;
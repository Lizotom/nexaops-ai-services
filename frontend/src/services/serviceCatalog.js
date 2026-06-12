const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Error en la solicitud");
  }

  return data;
}

export async function getServices(category = "all") {
  const response = await fetch(`${API_URL}/services?category=${category}`);
  return handleResponse(response);
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);
  return handleResponse(response);
}

export async function createService(serviceData, token) {
  const response = await fetch(`${API_URL}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(serviceData)
  });

  return handleResponse(response);
}

export async function updateService(id, serviceData, token) {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(serviceData)
  });

  return handleResponse(response);
}

export async function deleteService(id, token) {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return handleResponse(response);
}
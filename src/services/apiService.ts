import { SERVER_URL } from "./constants";

const API_URL = `${SERVER_URL}`;

const makeRequest = async (method: string, url: string, data?: unknown) => {
  const token = localStorage.getItem("accessToken");
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${url}`, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || "Request failed");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in ${method} request to ${url}:`, error);
    return error;
  }
};

export const postData = async (url: string, data: unknown) => {
  return await makeRequest("POST", url, data);
};

export const getData = async (url: string) => {
  return await makeRequest("GET", url);
};

export const putData = async (url: string, data: unknown) => {
  return await makeRequest("PUT", url, data);
};

export const deleteData = async (url: string, data: unknown) => {
  return await makeRequest("DELETE", url, data);
};

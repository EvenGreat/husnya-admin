import { apiAdmin } from "./api";

export const loginUser = (data) => {
    return apiAdmin.post("/auth/v1/login/admin", data);
};

export const registerUser = (data) => {
    return apiAdmin.post("/v1/register", data);
};

export const createCategory = (formData) => {
    return apiAdmin.post("/cat/v1/create/category",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

export const fetchCategory = () => {
    return apiAdmin.get("/cat/v1/fetch/category/all");
}

export const updateCategory = (id, formData) => {
    return apiAdmin.put(`/cat/v1/update/category/${id}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

export const deleteCategory = (id) => {
    return apiAdmin.delete(`/cat/v1/update/delete/${id}`)
}
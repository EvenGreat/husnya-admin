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
    return apiAdmin.delete(`/cat/v1/category/delete/${id}`)
}

export const createProduct = (formData) => {
    return apiAdmin.post(
        "/prod/v1/create/product/listing",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

export const fetchProduct = () => {
    return apiAdmin.get("/prod/get/all/products");
}

export const createCollection = (data) => {
    return apiAdmin.post(
        "/collectio/v1/create/collection",
        data,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

export const getAllCollection = () => {
    return apiAdmin.get("/collectio/v1/fetch/collection/all");
}

export const getCollaetionById = (id) => {
    return apiAdmin.get(`/collectio/v1/fetch/collection/${id}}`)
}

export const updateCollection = (id, data) => {
    return apiAdmin.put(`/collectio/v1/update/collection/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
}

export const deleteCollection = (id) => {
    return apiAdmin.delete(`/collectio/v1/collection/delete/${id}`)
}
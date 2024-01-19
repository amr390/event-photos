"use server";
import { CreateCategoryParams } from "@/types";
import { handleError, parseMongoToJson } from "../utils";
import Category from "../database/models/category.model";
import { connectToDB } from "../database";

export const createCategory = async ({
  categoryName,
}: CreateCategoryParams) => {
  try {
    await connectToDB();

    const newCategory = await Category.create({
      name: categoryName,
    });

    return parseMongoToJson(newCategory);
  } catch (error) {
    handleError(error);
  }
};

export const getAllCategories = async () => {
  try {
    await connectToDB();
    await connectToDB();

    const categories = await Category.find();

    return parseMongoToJson(categories);
  } catch (error) {
    handleError(error);
  }
};

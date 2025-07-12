import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({});
import "dotenv/config";

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:
      "List a few popular cookie recipes, and include the amounts of ingredients.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            recipeName: {
              type: Type.STRING,
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
          propertyOrdering: ["recipeName", "ingredients"],
        },
      },
    },
  });

  console.log(response.text);
}

main();

let a = [
  {
    recipeName: "Chocolate Chip Cookies",
    ingredients: [
      "1 cup (2 sticks) unsalted butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup packed light brown sugar",
      "2 large eggs",
      "1 teaspoon vanilla extract",
      "2 1/4 cups all-purpose flour",
      "1 teaspoon baking soda",
      "1/2 teaspoon salt",
      "2 cups (12 oz) chocolate chips",
    ],
  },
  {
    recipeName: "Oatmeal Raisin Cookies",
    ingredients: [
      "1 cup (2 sticks) unsalted butter, softened",
      "1 cup packed light brown sugar",
      "1/2 cup granulated sugar",
      "2 large eggs",
      "1 teaspoon vanilla extract",
      "1 1/2 cups all-purpose flour",
      "1 teaspoon baking soda",
      "1 teaspoon ground cinnamon",
      "1/2 teaspoon salt",
      "3 cups old-fashioned oats",
      "1 cup raisins",
    ],
  },
  {
    recipeName: "Sugar Cookies",
    ingredients: [
      "1 cup (2 sticks) unsalted butter, softened",
      "1 1/2 cups granulated sugar",
      "2 large eggs",
      "1 teaspoon vanilla extract",
      "3 cups all-purpose flour",
      "1 teaspoon baking powder",
      "1/2 teaspoon salt",
    ],
  },
];

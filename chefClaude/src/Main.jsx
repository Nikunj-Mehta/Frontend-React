import React from "react"
import IngredientsList from "./components/IngredientsList.jsx"
import ClaudeRecipe from "./components/ClaudeRecipe.jsx"
import { getRecipeFromMistral } from "./ai.js"

export default function Main() {
    const [ingredients, setIngredients] = React.useState([])
    const [recipe, setRecipe] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    const recipeSection = React.useRef(null)

    React.useEffect(() => {
        if (recipe !== "" && recipeSection.current !== null) {
            const yCoord = recipeSection.current.getBoundingClientRect().top + window.scrollY
            window.scroll({
                top: yCoord,
                behavior: "smooth"
            })
        }
    }, [recipe])

    async function getRecipe() {
        setLoading(true)
        const recipeMarkdown = await getRecipeFromMistral(ingredients)
        setRecipe(recipeMarkdown)
        setLoading(false)
    }

    function formatIngredient(ingredient) {
        const lowercased = ingredient.toLowerCase();
        return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
    }

    function addIngredient(formData) {
        const newIngredient = formData.get("ingredient").trim()

        if (newIngredient === "") return
        const formattedIngredient = formatIngredient(newIngredient)

        if (ingredients.includes(formattedIngredient)) return 

        setIngredients(prevIngredients => [...prevIngredients, formattedIngredient])
    }

    return (
        <main>
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    addIngredient(formData);
                    e.target.reset();
                }} 
                className="add-ingredient-form"
            >
                <input
                    type="text"
                    placeholder="e.g. oregano"
                    aria-label="Add ingredient"
                    name="ingredient"
                />
                <button>Add ingredient</button>
            </form>

            {ingredients.length > 0 &&
                <IngredientsList
                    ref={recipeSection}
                    ingredients={ingredients}
                    getRecipe={getRecipe}
                />
            }

            {loading && <p>Loading recipe...</p>}
            {!loading && recipe && <ClaudeRecipe recipe={recipe} />}

            {ingredients.length === 0 ? (
                <p className="add-items">Add at least 4 ingredients to get a recipe.</p>
            ) : ingredients.length < 4 ? (
                <p className="add-items">Add {4 - ingredients.length} more {ingredients.length === 3 ? "ingredient" : "ingredients"} to get a recipe.</p>
            ) : null}

            
        </main>
    )
}

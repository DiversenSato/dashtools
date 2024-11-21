import eslint from "@eslint/js";
import stylisticEslint from "@stylistic/eslint-plugin-js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            '@stylistic/js': stylisticEslint,
        },
        rules: {
            '@stylistic/js/semi': ['warn', 'always'],
            'quotes': ['error', 'double'],
        }
    },
)
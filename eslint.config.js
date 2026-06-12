import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import {defineConfig, globalIgnores} from 'eslint/config'

export default defineConfig([
    // 1. Глобально игнорируем dist, чтобы линтер туда не заглядывал
    globalIgnores(['dist']),

    // 2. Конфигурация для ВСЕХ TypeScript файлов (включая конфиги) базовыми правилами
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended, // Обычный recommended без проверки типов
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            globals: globals.browser,
        },
    },

    // 3. ОТДЕЛЬНЫЙ блок: Глубокая проверка типов ТОЛЬКО для файлов приложения (папка src)
    {
        files: ['src/**/*.{ts,tsx}'], // Применяется только к исходному коду вашего приложения
        extends: [
            ...tseslint.configs.recommendedTypeChecked, // Строгие правила типов
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
])

# Пошаговая реализация

Отмечать `[x]` сразу после завершения шага.

Отклонение от исходного ТЗ: вместо `gray-matter` в рантайме — `js-yaml` (FAILSAFE_SCHEMA) и свой разбор `---`. gray-matter тащит `eval` и Node `Buffer` в браузерный бандл.

---

## Шаг 1. Каркас Vite + Tailwind + Router

- [x] `package.json`, Vite, React, TypeScript
- [x] Tailwind CSS
- [x] React Router: `/`, `/day/:date`, `/settings`
- [x] Layout mobile first + нижний таббар (Календарь / Сегодня / Настройки)
- [x] Пустые экраны трёх маршрутов
- [x] `.gitignore` (`node_modules`, `dist`, `.env*`)

**Готово:** `npm run dev` открывает оболочку приложения.

---

## Шаг 2. Настройки и хранение токена

- [x] `localStorage`: token, owner, repo, branch, calendar view
- [x] Экран Settings: PAT (маска), owner, repo, ветка, «Проверить», «Выйти»
- [x] Без токена / репо — онбординг, в GitHub не ходим
- [x] Валидация `owner/repo`

**Готово:** настройки переживают reload.

---

## Шаг 3. Парсер дня (`src/lib/day-file`)

- [x] Типы `DayFile`, `DayTask`
- [x] `parseDayMarkdown` / `serializeDayMarkdown`
- [x] Правила: `[x]`/`[X]`/`[ ]`, `-`/`*`, `>`, CRLF, extra frontmatter и extra-секции
- [x] Фикстуры из плана (§12.14)
- [x] Vitest + round-trip тесты

**Готово:** `npm test` зелёный на фикстурах.

---

## Шаг 4. GitHub-слой

- [x] UTF-8-safe Base64
- [x] GET/PUT `data/graph_index.json` и `data/days/YYYY-MM-DD.md`
- [x] Очередь PUT на файл (один in-flight, свежий `sha`)
- [x] Человеческие ошибки: 401, 403, 404, 409, сеть
- [x] «Проверить доступ» через `repos.get`

**Готово:** слой компилируется, типы на месте.

---

## Шаг 5. Календарь

- [x] GET только `graph_index.json`
- [x] Вид месяц по умолчанию, неделя с понедельника, `ru-RU`
- [x] Вид год: 12 мини-месяцев
- [x] URL `?month=` / `?view=year&year=`
- [x] «Сегодня», подсветка, три состояния ячейки
- [x] Локальный оверлей после записи дня
- [x] Кнопка обновить индекс
- [x] 404 индекса = пустой календарь

**Готово:** сетка кликабельна без парсинга `.md`.

---

## Шаг 6. Страница дня

- [x] GET файла; 404 → пустая модель, файл не создавать
- [x] Просмотр: цель, план, чекбоксы, `>` как notes
- [x] Тап по цели/плану → компактное редактирование
- [x] Optimistic toggle + очередь PUT
- [x] Индикатор «сохраняем» / ошибка / «повторить»
- [x] «Добавить»: textarea, строки без `- [ ]` тоже задачи
- [x] Удаление задачи («⋯»)
- [x] Невалидная дата в URL → ошибка
- [x] Текст только как text, без HTML

**Готово:** пример ТЗ отображается; галочка и add пишут в Git.

---

## Шаг 7. Данные в репо + Actions

- [x] `data/days/.gitkeep`
- [x] стартовый `data/graph_index.json`
- [x] `scripts/bake-graph.ts` на том же парсере
- [x] `.github/workflows/build-graph.yml` (paths, concurrency, auto-commit)
- [x] `.github/workflows/ci.yml` (lint/test)

**Готово:** push в `data/days/**` печёт индекс; CI гоняет тесты.

---

## Шаг 8. README и приёмка

- [x] README: клон ≠ база, PAT, Actions write, ветка, запуск
- [x] Прогнать тесты
- [x] Сверить критерии из `PLAN.md` §11

**Готово:** новым пользователем можно пройти онбординг по README.

---

## Шаг 9. GitHub Pages

- [x] `.github/workflows/pages.yml` (build + `actions/deploy-pages` + ветка `gh-pages`)
- [x] `VITE_BASE` из `configure-pages` / `/<repo>/`
- [x] `BrowserRouter` basename из `import.meta.env.BASE_URL`
- [x] favicon через `%BASE_URL%favicon.svg` (не `/favicon.svg` с корня github.io)
- [x] `dist/404.html` = копия `index.html` (SPA-маршруты `/day/...`)
- [x] `public/.nojekyll`
- [x] README: не публиковать `main` как Pages; только Actions или ветка `gh-pages`

**Готово:** пуш кода на `main` публикует UI; данные по-прежнему только через API.

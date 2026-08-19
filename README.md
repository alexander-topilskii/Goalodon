# Goalodon

Личный трекер привычек, задач и тренировок. База данных — файлы Markdown в **вашем приватном GitHub-репозитории**. Своего сервера нет: UI (Vite + React) ходит в GitHub REST API из браузера.

Клон на ноутбуке — это код приложения. Календарь и дни **не читаются с диска**. Галочка в UI сразу пишет на GitHub; правка `.md` в IDE видна в приложении только после `git push`.

## Запуск

```bash
git clone <ваш-форк>
cd Goalodon
npm install
npm run dev
```

Откройте http://localhost:5173 → **Настройки**.

## Онбординг

1. Приватный fork или копия репозитория на GitHub (не публичный: в файлах будут цели и задачи).
2. **Actions → General → Workflow permissions → Read and write.** У форка сами Actions по умолчанию выключены — включите.
3. Fine-grained PAT только на этот репозиторий, permission **Contents: Read and write**. Classic token со scope `repo` тоже подойдёт, но он шире, чем нужно.
4. В UI: вставить токен, `owner`, имя репозитория, ветка (часто `main`) → **Проверить доступ**.

Токен хранится в `localStorage` этого браузера. Не кладите его в `.env` и не коммитьте.

## Данные

```
data/days/YYYY-MM-DD.md   # один день
data/graph_index.json     # печётся GitHub Actions для календаря
```

Формат дня — YAML frontmatter (`date`, `goal`), секции `## План` и `## Задачи` (чеклист и строки `>` как напоминания, без таймеров). Frontmatter разбирается через `js-yaml` (FAILSAFE), не через `gray-matter` — так в браузер не попадает `eval`.

Календарь грузит только `graph_index.json`. После пуша в `data/days/**` workflow `build-graph` пересобирает индекс. Пока Action не отработал, сетка может отставать на минуту — на странице есть **Обновить**, а после сохранения дня ячейка подкрашивается локально.

## GitHub Pages

UI собирается Actions и публикуется как статика. Данные (`/data`) в сборку **не входят** — приложение по-прежнему читает их через GitHub API.

1. **Settings → Pages → Source: GitHub Actions.**
2. Пуш в `main` (код приложения) или **Actions → Deploy GitHub Pages → Run workflow**.
3. Сайт: `https://<owner>.github.io/Goalodon/` (для репо `owner.github.io` корень сайта).

Workflow: `.github/workflows/pages.yml`. Меняется только код UI — пуш в `data/days/**` страницы не пересобирает.

Если репозиторий **приватный**, Pages на бесплатном аккаунте недоступен (нужен Pro/Team). Публичный репозиторий откроет и UI, и файлы в `/data`. Чтобы светить только приложение, держите данные в другом приватном репо и укажите его в Настройках UI. PAT по-прежнему живёт в браузере посетителя.

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | локальный UI |
| `npm test` | парсер и календарные даты |
| `npm run bake-graph` | пересобрать индекс локально |
| `npm run build` | production-сборка |

Подробный план: `plan/PLAN.md`, чеклист внедрения: `plan/IMPLEMENTATION.md`.

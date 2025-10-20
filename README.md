# CapitalView: Stocks Portfolio Tracker

## 🌟 Project Overview

**CapitalView** is a modern, full-stack web application designed for individual investors to track and manage their stock portfolios. Built with React for a dynamic frontend, styled with Tailwind CSS for a professional look, and powered by Supabase for a robust, scalable backend, this application provides dedicated views for dashboard summaries, portfolio management, and market stock browsing.

---

## 🚀 Features

* **Google OAuth Login:** Secure and easy authentication powered entirely by **Supabase Auth**.
* **User Dashboard (`/home`):** A high-level overview of total portfolios and quick access links.
* **Portfolio Management (`/portfolio`):** A dedicated, stateful view allowing users to:
    * Create new portfolios.
    * Select and view specific portfolio holdings.
    * Add new stock entries (symbol, quantity, purchase date, price).
* **Browse Stocks (`/browse-stocks`):** View historical stock price data fetched from the `stock_prices` table in Supabase, complete with client-side filtering and pagination.
* **Responsive Navigation:** A persistent Navbar across all main authenticated routes for easy navigation and secure logout.

---

## 🛠️ Technology Stack

**Frontend:**
* **React:** JavaScript library for building the user interface.
* **React Router v6:** Declarative routing for navigation.
* **Tailwind CSS:** Utility-first CSS framework for rapid, custom styling.

**Backend & Database:**
* **Supabase:** Used as a complete backend solution, providing:
    * **Authentication:** Google OAuth.
    * **Database:** PostgreSQL (for storing `portfolios`, `portfolio_stocks`, and market data in `stock_prices`).
    * **APIs:** Realtime API access for data fetching.

---

## ⚙️ Setup and Installation

Follow these steps to set up the project locally.

### 1. Prerequisites

You must have **Node.js** and **npm** (or yarn) installed.

### 2. Clone the Repository

```bash
git clone [https://github.com/Rishirxt/StocksPortfolio.git](https://github.com/Rishirxt/StocksPortfolio.git)
cd StocksPortfolio/frontend

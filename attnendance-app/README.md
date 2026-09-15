<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
## Database Creation
CREATE DATABASE attendance;<br>
use attendance;<br>
### Department Table
CREATE TABLE department(<br>
D_id INT PRIMARY KEY AUTO_INCREMENT,<br>
d_name VARCHAR(255) NOT NULL,<br>
role VARCHAR(255) NOT NULL<br>
);<br>
### Slot Table
CREATE TABLE slot(<br>
sl_id INT primary key auto_increment,<br>
start TIME NOT NULL,<br>
end TIME NOT NULL,<br>
slot_name VARCHAR(50) UNIQUE NOT NULL<br>
);<br>

>>>>>>> 963e6c8a89d126506020f88ec7566ad82fc81851

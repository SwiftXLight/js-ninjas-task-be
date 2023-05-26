# README - Web Application

This README provides instructions on how to run the web application, which consists of two repositories: the frontend and the backend. The application allows users to manage a list of heroes, perform CRUD operations, and upload images.

## Assumptions

- Node.js and npm are already installed on the system.
- MySQL is installed, and a database needs to be created for the application.
- The user has basic knowledge of web development and the command line interface.
- The backend server is set up and running before starting the frontend.

## Frontend Repository

### Installation

1. Clone the frontend repository to your local machine:

   ```shell
   git clone https://github.com/SwiftXLight/js-ninjas-task-fe.git
   ```

2. Navigate to the frontend directory:

   ```shell
   cd js-ninjas-task-fe
   ```

3. Install the required dependencies by running:

   ```shell
   npm install
   ```

### Running the Application

1. Start the frontend server by running:

   ```shell
   npm run start
   ```

2. Open your web browser and visit `http://localhost:3000` to access the application.

## Backend Repository

### Installation

1. Clone the backend repository to your local machine:

   ```shell
   git clone https://github.com/SwiftXLight/js-ninjas-task-be.git
   ```

2. Navigate to the backend directory:

   ```shell
   cd js-ninjas-task-be
   ```

3. Install the required dependencies by running:

   ```shell
   npm install
   ```

### Configuration

1. Create a `.env` file in the root directory of the backend repository.
2. Copy the contents of `.env.example` into `.env`.
3. Modify the variables in the `.env` file to match your desired configuration.

### Database Setup

1.  Ensure that MySQL is installed and running on your system.
2.  Use a MySQL client or command line interface to connect to the MySQL server.
3.  Create a new database for the application:

    `CREATE DATABASE heroes;`

4.  Modify the `.env` file in the backend repository to update the database connection configuration:

    ```shell
    PORT=5000
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=<your-mysql-username>
    DB_PASS=<your-mysql-password>
    DB_NAME=heroes
    ```

### Running the Application

1. Start the backend server by running:

   ```shell
   npm run start
   ```

   The server should now be running on `http://localhost:5000`.

## Usage

Once both the frontend and backend servers are running, you can use the web application as follows:

1.  Open your web browser and visit `http://localhost:3000` to access the application.
2.  The initial page will display an empty list of heroes.
3.  Click on the "Create" button to add a new hero.
4.  Fill in all the required fields and optionally upload up to 5 files for the hero.
5.  After creating a hero, they will appear in the list, and pagination will be enabled if there are more than 5 heroes.
6.  The pagination feature displays 5 heroes per page and shows only one page neighbor. It allows you to navigate through the pages using the following buttons:
    - "Previous" button: Click to go to the previous page.
    - "Next" button: Click to go to the next page.
    - "First" button: Click to go to the first page.
    - "Last" button: Click to go to the last page. Note: If you are on the first page, the "Previous" and "First" buttons will be disabled. If you are on the last page, the "Next" and "Last" buttons will be disabled.
7.  Each hero item in the list will have two buttons: "Delete" and "Details".
8.  Clicking the "Delete" button will remove the hero from the list.
9.  Clicking the "Details" button will redirect you to a detailed hero information page.
10. On the details page, you will find an "Edit" button to modify the hero's information.
11. Clicking the "Edit" button will redirect you to the edit page, where you can update the hero's details, including deleting selected photos or uploading new ones.
12. To go back to the list of heroes, click the "Back to List" button.

Please note the pagination behavior described above, which includes conditional display of pagination buttons based on the current page.

## Summary

This web application allows you to manage a list of heroes, perform CRUD operations, and upload images. Follow the installation, configuration, and usage instructions provided to run the application successfully. If you have any questions or encounter any issues, please refer to the documentation or seek assistance from the development team.

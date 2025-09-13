# amala-atlas-hackathon


Àmàlàmi

Project Description

Àmàlàmi is a community-driven web application designed to help users discover and share the best Àmàlà spots in their city. Built as a single-page application, the platform serves as a digital map and review guide, empowering Àmàlà lovers to crowdsource locations and insights. Our MVP focuses on a seamless user experience, from authentication to content creation, leveraging the power of modern web technologies and generative AI.


[Live Demo URL:](https://drive.google.com/drive/folders/1z3uBjqabpIcJZdSnYtCPZ6xknzYFY7Mp?usp=sharing)

Core Features (MVP)

User Authentication: Users can access the app and contribute as either an Authenticated User (signed in) or a Guest User (anonymous login).

Spot Submission: Authenticated users can easily add new Àmàlà spots to the public database by providing the spot's name, address, and an optional description.

Crowdsourced Map: All submitted spots are displayed in a dynamic "map" view, allowing the entire community to see and explore new locations in real-time.

Gemini API Integration: We integrated the Gemini API to power several innovative features:

AI-Powered Descriptions: Automatically generate creative descriptions for a new spot based on its name.

Image Analysis: Describe uploaded images to help users provide more context for their spot.

Review Summarization: Summarize multiple user reviews into a single, concise paragraph to provide quick insights for visitors.

Conversational Assistant: A chat assistant helps users navigate the app and provides information about finding Àmàlà spots.

Text-to-Speech: A text-to-speech function welcomes users to the app, adding an auditory layer to the user experience.

UI/UX Design

Figma Project Link

You can view and comment on the full ui/ux design, including all screens, components, and prototypes, at the following link:

[Amala Atlas - Full Design File (Mobile)](https://www.figma.com/proto/2K0SX6aPZ7QZJCH3D0wl04/Amala-app-ui?node-id=159-878&p=f&t=SX9Qxo0grj088fdJ-1&scaling=scale-down&content-scaling=fixed&page-id=159%3A466&starting-point-node-id=159%3A878)


Technologies Used

Frontend: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)

Backend as a Service: Firebase (Authentication and Firestore Database)

Generative AI: Google Gemini API

System Architecture

This simple diagram shows how the main components of our application are connected.

graph TD subgraph "Frontend (Single-Page App)" A[User Interface] end subgraph "Backend as a Service" B[Firebase Authentication] C[Firestore Database] end subgraph "Generative AI" D[Google Gemini API] end subgraph "The User" E[User] end E -- Interacts with --> A A -- Authenticates --> B A -- Reads & Writes Data --> C A -- Calls API to generate/analyze content --> D %% Notes style A fill:#f9f9f9,stroke:#333,stroke-width:2px style B fill:#F6BF00,stroke:#333,stroke-width:2px style C fill:#4285F4,stroke:#333,stroke-width:2px style D fill:#EA4335,stroke:#333,stroke-width:2px style E fill:#f9f9f9,stroke:#333,stroke-width:2px 

How to Run

This project is a single-page application and does not require a complex build process. Simply open the index.html file in any modern web browser to run the application.

Future Enhancements

Review and Rating System: Implement a full-featured review system where users can submit ratings and comments for each spot.

Geolocation: Use the browser's geolocation API to automatically suggest a user's current location when adding a new spot.

Image Uploads: Allow users to upload images of Àmàlà spots to the database for more comprehensive listings.

Search and Filters: Add functionality to search and filter spots by criteria such as rating, location, and price range.

Admin Dashboard: Create a separate admin interface for managing, approving, or removing submitted spots and reviews.


License
This project is licensed under the MIT License.


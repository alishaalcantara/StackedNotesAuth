I created a react app using Vite, titled StackNotes. With this app, users can create and write notes and store them all in the same place. This app is intended to make studying and note-taking more simple and organized.

Features:
1. Users will be able to create, edit, and delete learning notes.
2. Users will be able to search notes by keyword.
3. Users will be able to bookmark important notes.
4. Users will be able to sort notes by most viewed or newest.
5. Users will be able to modify text font sizes, colors, and bolden/italicize text.
6. Users will be able to create flashcards from their note of choice just by simply clicking the "Flashcard Me!" button.

I also implmented a user login/logout feature to my existing StackNotes app. This login/logout feature includes email and password authentication. Becuase of this, each user has private access to their own work across multiple sessions on different devices. When you sign up or log in, you're directed to the StackNotes dashboard and your notes are only visible to you. Logging out redirects you back to the login page, and protected routes prevent unauthenticated users from accessing your account. This login/logout feature was implemented with Supabase. To run the app and test the feature, you just press the deployment link and create an account. Upon typing your email, you are going to recieve an email verifciation link. Once you recieve and press on the link, you will now have access to your StackNotes account!

// backend/db/seed-data.js
//
// Demo data for the seeder in db/seeders/20261123000000-demo-data.js.
// Relationships use natural keys (username, album title, song title) instead
// of fixed numeric ids, so the database picks the ids itself. That keeps
// Postgres' auto-increment counters correct (see CHANGES.md, S0).
//
// The passwords are for public demo accounts only; they are hashed with
// bcrypt when the seeder runs.
'use strict';

module.exports =
{
  "users": [
    {
      "username": "Demo-lition",
      "email": "demo@user.io",
      "password": "password",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/propic-4.jpg"
    },
    {
      "username": "Los Lonley Boys",
      "email": "loslonleyboys@user.io",
      "password": "password2",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/propic-7.jpg"
    },
    {
      "username": "Mac Miller",
      "email": "macmiller@user.io",
      "password": "password3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/propic-8.jpg"
    },
    {
      "username": "Leon Bridges",
      "email": "leonbridges@user.io",
      "password": "password3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/propic-5.jpg"
    },
    {
      "username": "Kid Cudi",
      "email": "kidcudi@user.io",
      "password": "password3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/propic-6.jpg"
    },
    {
      "username": "JohnSmith",
      "email": "john.smith@gmail.com",
      "password": "JohnsPassword",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/propic-4.jpg"
    },
    {
      "username": "JaneDoe",
      "email": "jane.doe@gmail.com",
      "password": "JanesPassword",
      "previewImage": "imahttps://soundcloud-bucket.s3.us-west-2.amazonaws.com/propic-5.jpggeurl"
    }
  ],
  "albums": [
    {
      "title": "Sacred",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set, released on July 18, 2006.",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "Hyrbrid Theory",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park, released on October 24, 2000",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "owner": "Demo-lition"
    },
    {
      "title": "Meteora",
      "description": "Meteora is the second studio album by American rock band Linkin Park. It was released on March 25, 2003",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "owner": "Demo-lition"
    },
    {
      "title": "Coming Home",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges. It was released on June 23",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "owner": "Leon Bridges"
    },
    {
      "title": "K.I.D.S",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "owner": "Mac Miller"
    },
    {
      "title": "Circles",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "owner": "Mac Miller"
    },
    {
      "title": "Entergalactic",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi. The album was issued on September 30, 2022",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "owner": "Kid Cudi"
    }
  ],
  "songs": [
    {
      "title": "My Way",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/01+My+Way.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "Oracle",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/02+%C3%93rale.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "Diamonds",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/03+Diamonds.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "Oye Mamacita",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/04+Oye+Mamacita.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "I Never Met A Woman",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/05+I+Never+Met+A+Woman.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "Roses",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/06+Roses.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "Texican Style",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/07+Texican+Style.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "One More Day",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/08+One+More+Day.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "Memories",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/09+Memories.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "My Loneliness",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/10+My+Loneliness.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "Outlaws",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/11+Outlaws.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "Home",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/12+Home.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "Living My Life",
      "description": "Sacred is the Los Lonely Boys' fourth album and their second studio set",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Los+Lonely+Boys/Sacred/13+Living+My+Life.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Sacred.jpg",
      "album": "Sacred",
      "owner": "Los Lonley Boys"
    },
    {
      "title": "Papercut",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/01+Papercut.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "One Step Closer",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/02+One+Step+Closer.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "With You",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/03+With+You.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "Points of Authority",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/04+Points+Of+Authority.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "Crawling",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/05+Crawling.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "Runaway",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/06+Runaway.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "By Myself",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/07+By+Myself.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "In The End",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/08+In+The+End.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "A Place for my Head",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/09+A+Place+For+My+Head.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "Forgotten",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/10+Forgotten.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "Cure For the Itch",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/11+Cure+For+The+Itch.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "Pushing Me Away",
      "description": "Hybrid Theory is the debut studio album by American rock band Linkin Park",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Hybrid+Theory/12+Pushing+Me+Away.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/HyrbridTheory.jpg",
      "album": "Hyrbrid Theory",
      "owner": "Demo-lition"
    },
    {
      "title": "Foreword",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/01+Foreword.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Dont Stay",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/02+Don't+Stay.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Somewhere I Belong",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/03+Somewhere+I+Belong.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Lying From You",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/04+Lying+From+You.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Hit the Floor",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/05+Hit+The+Floor.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Easier to Run",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/06+Easier+To+Run.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Faint",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/07+Faint.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Figure",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/09+Breaking+The+Habit.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Breaking the Habit",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/08+Figure.09.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "From the Inside",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/10+From+The+Inside.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Nobodys Listening",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/11+Nobody's+Listening.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Session",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/12+Session.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Numb",
      "description": "Meteora is the second studio album by American rock band Linkin Park.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin+Park/Meteora/13+Numb.m4a",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Linkin_Park_Meteora_Album_Cover.jpg",
      "album": "Meteora",
      "owner": "Demo-lition"
    },
    {
      "title": "Coming Home",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Leon+Bridges/Coming+Home+(Deluxe)/Leon+Bridges/Coming+Home.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Better Man",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Leon+Bridges/Coming+Home+(Deluxe)/Leon+Bridges/Better+Man.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Brown Skin Girl",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Leon+Bridges/Coming+Home+(Deluxe)/Leon+Bridges/Brown+Skin+Girl.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Smooth Sailin",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Leon+Bridges/Coming+Home+(Deluxe)/Leon+Bridges/Smooth+Sailin'.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Shine",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Leon+Bridges/Coming+Home+(Deluxe)/Leon+Bridges/Shine.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Lisa Sawyer",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Leon+Bridges/Coming+Home+(Deluxe)/Leon+Bridges/Lisa+Sawyer.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Flowers",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Leon+Bridges/Coming+Home+(Deluxe)/Leon+Bridges/Flowers.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Pull Away",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Leon+Bridges/Coming+Home+(Deluxe)/Leon+Bridges/Pull+Away.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Twistin & Groovin",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Leon+Bridges/Coming+Home+(Deluxe)/Leon+Bridges/Twistin'+%26+Groovin'.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "River",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Leon+Bridges/Coming+Home+(Deluxe)/Leon+Bridges/River.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "There She Goes",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/There+She+Goes.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Daisy Mae",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Daisy+Mae.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Mississippi Kisses",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Mississippi+Kisses.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Here In My Arms",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Here+In+My+Arms.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "Outta Line",
      "description": "Coming Home is the debut studio album by American singer Leon Bridges.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Outta+Line.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Coming_Home_Leon_Bridges.jpg",
      "album": "Coming Home",
      "owner": "Leon Bridges"
    },
    {
      "title": "K.I.D.S",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Kickin+Incredibly+Dope+Shit+(Intro)+(Prod.+DT+Spacely).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Outside",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Outside+(Prod.+Sayez).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Get Em Up",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Get+Em+Up+(Prod.+93'+P.).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Nikes on My Feet",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Mac+Miller+-+Nikes+on+my+Feet+(Music+%2B+Lyrics).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Senior Skip Day",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Mac+Miller+-+Senior+Skip+Day.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "The Spins",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/The+Spins+(Prod.+B+%5Bdot%5D+Jay).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Dont Mind If I Do",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Mac+Miller+-+Don't+Mind+If+I+Do.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Paper Route",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Paper+Route+ft.+Chevy+Woods+(Prod.+Sayez).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Good Evening",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Mac+miller+-+good+evening.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Ride Around",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Mac+Miller+-+Ride+Around.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Knock Knock",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Mac+Miller+-+Knock+Knock.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Mad Flava, Heavy Flow",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Mac+Miller+-+Mad+Flava+Heavy+Flow.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Kool Aid & Frozen Pizza",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Mac+Miller+-+Kool+Aid+And+Frozen+Pizza.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "All I Want is You",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/All+I+Want+Is+You+(Prod.+Willis+Beats).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Poppy",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/send/Poppy+(Prod.+Black+Diamond).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Face in the Crowd",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Mac+Miller+-+Face+In+The+Crowd.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Ayye",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Mac+Miller+-+Ayye+(Prod.+ID+Labs).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Back in the Day",
      "description": "K.I.D.S. is the fourth mixtape by American rapper Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Mac+Miller+-+Back+In+The+Day+(Prod.+Will+Brown).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_K.I.D.S._cover_art.jpg",
      "album": "K.I.D.S",
      "owner": "Mac Miller"
    },
    {
      "title": "Circles",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Mac+Miller+-+Circles.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Complicated",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Mac+Miller+-+Complicated.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Blue World",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Mac+Miller+-+Blue+World.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Good News",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Mac+Miller+-+Good+News.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "I Can See",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Mac+Miller+-+I+Can+See.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Everybody",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Mac+Miller+-+Everybody.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Woods",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Mac+Miller+-+Woods.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Hand Me Downs",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Mac+Miller+-+Hand+Me+Downs.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "That's On Me",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Mac+Miller+-+That's+On+Me.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Hands",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Mac+Miller+-+Hands.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Surf",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Mac+Miller+-+Surf+(Lyrics).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Once A Day",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Mac+Miller+-+Once+A+Day+(LYRICS).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Right",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Mac+Miller+-+Right+(Lyrics).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Floating",
      "description": "Circles is the sixth and final studio album by American rapper and singer Mac Miller.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Mac+Miller+-+Floating+(Lyrics).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Mac_Miller_-_Circles.jpg",
      "album": "Circles",
      "owner": "Mac Miller"
    },
    {
      "title": "Entergalactic Theme",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Kid+Cudi+-+Entergalactic+Theme+(EXTENDED+INTRO).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "New Mode",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Kid+Cudi+-+New+Mode.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "Do What I Want",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Kid+Cudi+-+Do+What+I+Want.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "Angel",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Kid+Cudi+-+Angel.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "Ignite The Love",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Kid+Cudi+-+Ignite+The+Love.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "In Love",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Kid+Cudi+-+In+Love+_+Entergalactic.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "Willing to Trust",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Kid+Cudi+-+Willing+To+Trust.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "Cant Believe it",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Kid+Cudi+-+CAN'T+BELIEVE+IT+(ft.+2+Chainz)+(Lyrics).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "Livin My Truth",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/send/Kid+Cudi+-+LIVIN'+MY+TRUTH+(Lyrics).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "Maybe So",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Kid+Cudi+-+Maybe+So+(Lyrics).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "Cant Shake Her",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Kid+Cudi+ft+Ty+Dolla+Sign+-+Can't+Shake+Her+(Lyrics).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "Shes Lookin for Me",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Kid+Cudi+-+She's+Lookin+For+Me.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "My Drug",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Kid+Cudi+-+My+Drug.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "Somewhere To Fly",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Kid+Cudi+-+Somewhere+To+Fly.mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    },
    {
      "title": "Burrow",
      "description": "Entergalactic is the eighth studio album by American musician Kid Cudi.",
      "url": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Entergalactic/Kid+Cudi+-+Burrow+(Bonus+Track).mp3",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/Kid_Cudi_-_Entergalactic.jpg",
      "album": "Entergalactic",
      "owner": "Kid Cudi"
    }
  ],
  "playlists": [
    {
      "name": "Chill",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg2.jpg",
      "owner": "Demo-lition",
      "songs": [
        "My Way",
        "Oracle",
        "Papercut",
        "One Step Closer",
        "Foreword",
        "Dont Stay",
        "Coming Home",
        "Better Man",
        "K.I.D.S",
        "Outside",
        "Circles"
      ]
    },
    {
      "name": "Summer Nights",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg12.jpg",
      "owner": "Demo-lition",
      "songs": [
        "Complicated",
        "Blue World",
        "Entergalactic Theme",
        "New Mode",
        "Diamonds",
        "Oye Mamacita",
        "With You",
        "Points of Authority",
        "Somewhere I Belong",
        "Lying From You"
      ]
    },
    {
      "name": "Plug Away",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg13.jpg",
      "owner": "Demo-lition",
      "songs": [
        "Brown Skin Girl",
        "Smooth Sailin",
        "Get Em Up",
        "Nikes on My Feet",
        "Good News",
        "I Can See",
        "Do What I Want",
        "Angel",
        "I Never Met A Woman",
        "Roses"
      ]
    },
    {
      "name": "Smile",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg14.jpg",
      "owner": "Los Lonley Boys",
      "songs": [
        "Crawling",
        "Runaway",
        "Easier to Run",
        "Faint",
        "Shine",
        "Lisa Sawyer",
        "Senior Skip Day",
        "The Spins",
        "Everybody",
        "Woods"
      ]
    },
    {
      "name": "Drive",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg15.jpg",
      "owner": "Los Lonley Boys",
      "songs": [
        "Ignite The Love",
        "In Love",
        "Texican Style",
        "One More Day",
        "By Myself",
        "In The End",
        "Hit the Floor",
        "Figure",
        "Flowers",
        "Pull Away"
      ]
    },
    {
      "name": "Take A Hike",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg10.jpeg",
      "owner": "Los Lonley Boys",
      "songs": [
        "Dont Mind If I Do",
        "Paper Route",
        "Hand Me Downs",
        "That's On Me",
        "Willing to Trust",
        "Cant Believe it",
        "Memories",
        "My Loneliness",
        "A Place for my Head",
        "Forgotten"
      ]
    },
    {
      "name": "China Town",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg8.jpg",
      "owner": "Mac Miller",
      "songs": [
        "Breaking the Habit",
        "From the Inside",
        "Twistin & Groovin",
        "River",
        "Good Evening",
        "Ride Around",
        "Hands",
        "Surf",
        "Livin My Truth",
        "Maybe So"
      ]
    },
    {
      "name": "Game Away",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg6.jpg",
      "owner": "Mac Miller",
      "songs": [
        "Outlaws",
        "Home",
        "Cure For the Itch",
        "Pushing Me Away",
        "Nobodys Listening",
        "Session",
        "There She Goes",
        "Daisy Mae",
        "Knock Knock",
        "Mad Flava, Heavy Flow"
      ]
    },
    {
      "name": "Weekend Hangout",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg4.jpg",
      "owner": "Mac Miller",
      "songs": [
        "Once A Day",
        "Right",
        "Cant Shake Her",
        "Shes Lookin for Me",
        "Living My Life",
        "Numb",
        "Mississippi Kisses",
        "Here In My Arms",
        "Outta Line",
        "Kool Aid & Frozen Pizza"
      ]
    },
    {
      "name": "Lonely Adventure",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg5.jpg",
      "owner": "Leon Bridges",
      "songs": [
        "All I Want is You",
        "Poppy",
        "Face in the Crowd",
        "Ayye",
        "Back in the Day",
        "Floating",
        "My Drug",
        "Somewhere To Fly",
        "Burrow",
        "I Never Met A Woman"
      ]
    },
    {
      "name": "Beach Vibes",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg7.jfif",
      "owner": "Leon Bridges",
      "songs": [
        "Forgotten",
        "From the Inside",
        "Brown Skin Girl",
        "Good Evening",
        "Outside",
        "Nikes on My Feet",
        "Circles",
        "Back in the Day",
        "Hand Me Downs",
        "Once A Day"
      ]
    },
    {
      "name": "Deep Thoughts",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg3.jpg",
      "owner": "Leon Bridges",
      "songs": [
        "Entergalactic Theme",
        "Willing to Trust",
        "Livin My Truth",
        "Texican Style",
        "Foreword",
        "Easier to Run",
        "Nobodys Listening",
        "Smooth Sailin",
        "Outta Line",
        "Get Em Up"
      ]
    },
    {
      "name": "Study Away",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg1.jpg",
      "owner": "Kid Cudi",
      "songs": [
        "Paper Route",
        "Oracle",
        "Memories",
        "Home",
        "The Spins",
        "Faint",
        "Shine",
        "In Love",
        "Floating",
        "Crawling"
      ]
    },
    {
      "name": "The Future",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg9.jpg",
      "owner": "Kid Cudi",
      "songs": [
        "Numb",
        "River",
        "Senior Skip Day",
        "Poppy",
        "Woods",
        "Do What I Want",
        "My Drug",
        "Burrow",
        "Points of Authority",
        "Dont Stay"
      ]
    },
    {
      "name": "Lunch Time",
      "previewImage": "https://soundcloud-bucket.s3.us-west-2.amazonaws.com/playlistimages/playlistimg11.jpg",
      "owner": "Kid Cudi",
      "songs": [
        "Session",
        "Twistin & Groovin",
        "All I Want is You",
        "Everybody",
        "New Mode",
        "Shes Lookin for Me",
        "Runaway",
        "Lying From You",
        "Coming Home",
        "There She Goes"
      ]
    }
  ],
  "comments": [
    {
      "body": "This is a comment for song 1",
      "song": "My Way",
      "author": "Demo-lition"
    },
    {
      "body": "This is a comment for song 2",
      "song": "Oracle",
      "author": "Los Lonley Boys"
    }
  ]
};

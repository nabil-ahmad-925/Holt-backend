// authController.js
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables from .env file
const bcrypt = require("bcrypt");

const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

 // Function to generate access token
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "20m" } // Set token expiration time as needed
  );
}

// Function to generate refresh token
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username },
    '57asdtsdfdsfsdfsdfhdschsdkjcbd'
  );
}

// Login function
exports.login = async function (req, res) {

  console.log("EMail===++>",req.body)

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Username or password required" });
  }

  try {
    // Fetch user from the 'users' table based on the username
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    
    console.log("Users-==========++>", users);
    const user = users[0]; // Assuming usernames are unique

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

     // Generate access token and refresh token
     const accessToken = generateAccessToken(user);
     const refreshToken = generateRefreshToken(user);

 
     // For now, we will just return the tokens in the response
     res.json({ accessToken, refreshToken });
   } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Refresh token function
exports.refreshToken = async function (req, res) {
  console.log("Refresh token called from backend... ");
  console.log("Token body ...",req.body);
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Fetch user from the database based on decoded payload
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Signup function
exports.signup = async function (req, res) {
  const { username, email, password } = req.body;
   
  try {
    // Check if the user already exists in the 'users' table
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email);

    if (existingUser && existingUser.length > 0) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    // Hash the password before storing it in the 'users' table
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the 'users' table
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .upsert([
        {
          username:email,
          email,
          password: hashedPassword,
        },
      ]);

    if (insertError) {
      throw insertError;
    }

    res
      .status(201)
      .json({ user: newUser, message: "User created successfully" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Forgot Password function
exports.forgotPassword = function (req, res) {
  // Handle forgot password logic here
  // Generate and send a password reset email or perform the necessary steps
  // Send appropriate response
};

exports.verifyToken = async function (req, res) {
  try {
    // Parse the token from the request body
    const token = req.body.apiKey;

    // Decode the token to get the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("User decoded===>", decoded);
    // Extract user ID from the decoded payload
    const userId = decoded.userId;

    // Send a request to Supabase users table to get the user against the user ID
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user from Supabase:", error);
      res.status(500).json({ message: "Internal Server Error" });
    } else if (user) {
      console.log("User is authenticated:", user);
      res.json({ message: "User is authenticated", user: user });
    } else {
      console.log("User not found in Supabase");
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

 

exports.saveSummary = async function (req, res) {

    console.log("sumaary data ===> ",req.body)
    try {
      const {
        userid,
        video_url,
        transcript,
        summary,
        captions,
        videoid,
        title,
        description,
        channelid,
        channelname,
        videolengthseconds,
        viewcount,
        publishedtime,
   
      } = req.body;
      // Insert data into the 'videos' table
      const { data, error } = await supabase.from("video_data").upsert([
        {
          userid,
          video_url,
          transcript,
          summary,
          videoid,
          title,
          description,
          channelid,
          channelname,
          videolengthseconds,
          viewcount,
          publishedtime,
          captions,
        },
      ]);

      if (error) {
        console.error("Error saving data to Supabase:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      console.log("Data saved successfully:", data);
      return res.json({ message: "Summary created" });
    } catch (err) {
      console.error("Unexpected error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };


exports.getAllSummaries = async function (req, res) {
    try {
      // Fetch all data from the 'video_data' table
      const { data, error } = await supabase.from("video_data").select("*");
  
      if (error) {
        console.error("Error fetching data from Supabase:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      console.log("Data fetched successfully:", data);
      return res.json({ summaries: data });
    } catch (err) {
      console.error("Unexpected error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
 

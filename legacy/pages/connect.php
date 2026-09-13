<?php
session_start();
$servername = "localhost";
$username = "root";
$password = "";
$db = "blackcar";

$con = mysqli_connect($servername, $username, $password, $db);

if (!$con) {
    die("Connection failed: " . mysqli_connect_error());
}

if (isset($_POST['submit'])) {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $categories = $_POST['categories'];
    $date = $_POST['date'];
    $message = $_POST['message'];

    // Validate the date
    $userInputDate = $date;
    $sanitizedDate = mysqli_real_escape_string($con, $userInputDate);

    // Get today's date
    $today = date('Y-m-d');

    // Check if the date is in the past, today, or in the database
    if ($sanitizedDate <= $today) {
        $_SESSION['status'] = "Sikertelen foglalás - A kiválasztott dátum nem lehet a múltbéli vagy mai dátum";
        header("Location: sikertelen.html");
        exit();
    }

    $checkQuery = "SELECT COUNT(*) as count FROM foglalas WHERE date = '$sanitizedDate' OR date = '$today'";
    $checkResult = mysqli_query($con, $checkQuery);

    if ($checkResult) {
        $row = mysqli_fetch_assoc($checkResult);
        $count = $row['count'];

        if ($count > 0) {
            // Date is in the past, today, or in the database
            $_SESSION['status'] = "Sikertelen foglalás - A kiválasztott dátum már foglalt vagy múltbéli dátum. Kérlek próbáld újra!";
            header("Location: sikertelen.html");
            exit();
        } else {
            // Date is not in the past, not today, and not in the database, proceed with the insertion
            $insertQuery = "INSERT INTO foglalas (name,email,phone,categories,date,message) VALUES ('$name','$email','$phone','$categories','$date','$message')";
            $insertResult = mysqli_query($con, $insertQuery);

            if ($insertResult) {
                $_SESSION['status'] = "Sikeres foglalás";
                header("Location: sikeres.html");
                /*
                $to = $email;
                $subject = "Sikeres foglalás!";
                $message = "Kedves $name!\n\nVárunk sok szeretettel a kozmetikában! (3000, Hatvan Csányi út 16.\n\n Foglalás időpontja:$date \n\n Köszönjük, hogy a Black Car Autókozmetikát választottad!\n";

                // Additional headers if needed
                $headers = "Üvdözlettel: Black Car Autókozmetika";

                // Send the email
                mail($to, $subject, $message, $headers);
                */
                exit();
            } else {
                $_SESSION['status'] = "Sikertelen foglalás - Adatbázis hiba";
                header("Location: sikertelen.html");
                exit();
            }
        }
    } else {
        // Handle database query error
        $_SESSION['status'] = "Sikertelen foglalás - Adatbázis hiba";
        header("Location: sikertelen.html");
        exit();
    }

    // Close the database connection when you're done
    mysqli_close($con);
}
?>

<?php
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);

     $servername = '';
     $username = '';
     $password = '           ';
     $db_name='        ';
     
     // Mi connetto 
     $conn = mysqli_connect($servername, $username, $password,$db_name);
     
     // Controllo la connessione
     if (!$conn) {
       die("Connection failed: " . mysqli_connect_error());
     }
     //Passo la query come stringa
     $sql="Select * from ";
     $ris=mysqli_query($conn, $sql);

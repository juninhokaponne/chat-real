<?php

$host = "localhost";
$user = "root" ;
$pass = "" ;
$dbname = "crud" ;
$port = 3306 ;

// conexão com a porta
$conn = new  PDO ( "mysql: host = $ host; port = $ port; dbname =" . $dbname,$user,$pass );

// conexão sem a porta
// $ conn = new PDO ("mysql: host = $ host; dbname =". $ dbname, $ user, $ pass);



?>
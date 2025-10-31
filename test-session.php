<?php
session_start();

// Simular login (SOLO PARA PRUEBAS)
$_SESSION['usuario_id'] = 1;
$_SESSION['usuario_nombre'] = 'Usuario de Prueba';

echo "Sesión creada. <a href='public/html/proyectos.php'>Ir a proyectos</a>";
?>
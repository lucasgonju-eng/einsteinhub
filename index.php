<?php
// Garantir que o domínio carregue a landing mesmo se o servidor priorizar index.php.
readfile(__DIR__ . '/index.html');

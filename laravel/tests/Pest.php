<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\Support\AlquileresFixtures;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->in('Feature/Auth', 'Feature/ExampleTest.php', 'Feature/ProfileTest.php');

/*
| Tests\Support\AlquileresFixtures inserta datos minimos directamente en las
| 18 tablas de negocio heredadas de la app legacy (no gestionadas por
| migraciones Laravel). DatabaseTransactions envuelve cada test en una
| transaccion y la revierte al final -- nunca RefreshDatabase, que correria
| migrate:fresh y borraria esas tablas (no las recrea, solo Laravel las
| conoce via el dump de esquema importado una vez en alquileres_db_test).
*/
pest()->extend(TestCase::class)
    ->use(DatabaseTransactions::class)
    ->use(AlquileresFixtures::class)
    ->in('Feature/Services');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

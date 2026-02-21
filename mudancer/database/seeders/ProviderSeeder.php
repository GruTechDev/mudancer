<?php

namespace Database\Seeders;

use App\Models\Provider;
use Illuminate\Database\Seeder;

class ProviderSeeder extends Seeder
{
    public function run(): void
    {
        $providers = [
            [
                'nombre'      => 'Moreno Moving',
                'email'       => 'contacto@morenomovingmx.com',
                'telefono'    => '55 1234 5678',
                'rfc'         => 'MMO870312AB1',
                'domicilio'   => 'Av. Insurgentes Sur 1602, Col. Crédito Constructor, CDMX',
                'responsable' => 'Carlos Moreno Ávila',
                'reputacion'  => 5,
            ],
            [
                'nombre'      => 'Intermoving',
                'email'       => 'info@intermoving.com.mx',
                'telefono'    => '55 8765 4321',
                'rfc'         => 'INT920805CD2',
                'domicilio'   => 'Calle Orizaba 45, Col. Roma Norte, CDMX',
                'responsable' => 'Lucía Hernández Torres',
                'reputacion'  => 4,
            ],
            [
                'nombre'      => 'Gaestra Mudanzas',
                'email'       => 'ventas@gaestramudanzas.mx',
                'telefono'    => '33 2345 6789',
                'rfc'         => 'GAE010418EF3',
                'domicilio'   => 'Blvd. Puerta de Hierro 5153, Zapopan, Jalisco',
                'responsable' => 'Fernando Gaestra López',
                'reputacion'  => 4,
            ],
            [
                'nombre'      => 'IS Moving',
                'email'       => 'operaciones@ismoving.com.mx',
                'telefono'    => '81 3456 7890',
                'rfc'         => 'ISM051122GH4',
                'domicilio'   => 'Av. Constitución 300, Centro, Monterrey, N.L.',
                'responsable' => 'Iván Salazar Mendoza',
                'reputacion'  => 5,
            ],
            [
                'nombre'      => 'Gomez Transport and Moving',
                'email'       => 'servicios@gomeztransport.mx',
                'telefono'    => '55 4567 8901',
                'rfc'         => 'GTM780930IJ5',
                'domicilio'   => 'Calzada de Tlalpan 1200, Col. Country Club, CDMX',
                'responsable' => 'Roberto Gómez Castillo',
                'reputacion'  => 5,
            ],
            [
                'nombre'      => 'Express Mudanzas MX',
                'email'       => 'hola@expressmudanzas.mx',
                'telefono'    => '55 5678 9012',
                'rfc'         => 'EMM110601KL6',
                'domicilio'   => 'Periférico Norte 2100, Tlalnepantla, Estado de México',
                'responsable' => 'Diana Pérez Ruiz',
                'reputacion'  => 4,
            ],
            [
                'nombre'      => 'MudaTech Servicios',
                'email'       => 'contacto@mudatech.com.mx',
                'telefono'    => '55 6789 0123',
                'rfc'         => 'MTS150720MN7',
                'domicilio'   => 'Lago Zurich 219, Col. Ampliación Granada, CDMX',
                'responsable' => 'Alejandro Cruz Noriega',
                'reputacion'  => 3,
            ],
            [
                'nombre'      => 'Fletes y Mudanzas del Norte',
                'email'       => 'atencion@fletnorte.com',
                'telefono'    => '614 7890 1234',
                'rfc'         => 'FMN690815OP8',
                'domicilio'   => 'Av. Tecnológico 9000, Chihuahua, Chih.',
                'responsable' => 'Patricia Villanueva Soto',
                'reputacion'  => 4,
            ],
            [
                'nombre'      => 'Mudanzas Confianza',
                'email'       => 'info@mudanzasconfianza.mx',
                'telefono'    => '222 8901 2345',
                'rfc'         => 'MCO830528QR9',
                'domicilio'   => 'Blvd. Atlixcáyotl 5500, San Andrés Cholula, Puebla',
                'responsable' => 'Miguel Ángel Ramírez Flores',
                'reputacion'  => 5,
            ],
            [
                'nombre'      => 'Traslados Premium GDL',
                'email'       => 'premium@trasladosgdl.com',
                'telefono'    => '33 9012 3456',
                'rfc'         => 'TPG951104ST0',
                'domicilio'   => 'Av. Vallarta 6503, Zapopan, Jalisco',
                'responsable' => 'Sofía Medina Orozco',
                'reputacion'  => 5,
            ],
        ];

        foreach ($providers as $data) {
            Provider::updateOrCreate(
                ['email' => $data['email']],
                $data
            );
        }
    }
}

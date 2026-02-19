<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Provider extends Model
{
    protected $fillable = [
        'nombre', 'rfc', 'domicilio', 'telefono', 'email', 'responsable', 'logo', 'reputacion',
    ];

    protected function casts(): array
    {
        return [
            'reputacion' => 'decimal:2',
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Provider extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    protected $fillable = [
        'user_id', 'nombre', 'rfc', 'domicilio', 'telefono', 'email', 'responsable', 'logo', 'reputacion',
    ];

    protected function casts(): array
    {
        return [
            'reputacion' => 'decimal:2',
        ];
    }
}

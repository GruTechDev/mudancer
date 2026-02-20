<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    protected $fillable = [
        'lead_id', 'provider_id', 'precio_total', 'apartado', 'anticipo', 'pago_final',
        'tarifa_seguro', 'notas', 'seleccionada', 'vista',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}

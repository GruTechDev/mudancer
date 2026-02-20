<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    protected $fillable = [
        'lead_id', 'nombre_cliente', 'email_cliente', 'telefono_cliente',
        'estado_origen', 'localidad_origen', 'colonia_origen', 'piso_origen',
        'elevador_origen', 'acarreo_origen',
        'estado_destino', 'localidad_destino', 'colonia_destino', 'piso_destino',
        'elevador_destino', 'acarreo_destino',
        'empaque', 'fecha_recoleccion', 'tiempo_estimado', 'modalidad', 'seguro',
        'inventario', 'articulos_delicados', 'observaciones',
        'publicada', 'adjudicada', 'concluida', 'vista',
    ];
}

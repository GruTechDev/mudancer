<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for all Lead model fields except lead_id.
     */
    public function rules(): array
    {
        return [
            'nombre_cliente' => 'required|string|max:255',
            'email_cliente' => 'required|email',
            'telefono_cliente' => 'required|string|size:10|regex:/^[0-9]+$/',
            'estado_origen' => 'nullable|string|max:255',
            'localidad_origen' => 'nullable|string|max:255',
            'colonia_origen' => 'nullable|string|max:255',
            'piso_origen' => 'nullable|string|max:255',
            'elevador_origen' => 'nullable|boolean',
            'acarreo_origen' => 'nullable|integer|min:0',
            'estado_destino' => 'nullable|string|max:255',
            'localidad_destino' => 'nullable|string|max:255',
            'colonia_destino' => 'nullable|string|max:255',
            'piso_destino' => 'nullable|string|max:255',
            'elevador_destino' => 'nullable|boolean',
            'acarreo_destino' => 'nullable|integer|min:0',
            'empaque' => 'nullable|string|max:255',
            'fecha_recoleccion' => 'nullable|date',
            'tiempo_estimado' => 'nullable|string|max:255',
            'modalidad' => 'nullable|string|max:255',
            'seguro' => 'nullable|numeric|min:0',
            'inventario' => 'nullable|string',
            'articulos_delicados' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'publicada' => 'nullable|boolean',
            'adjudicada' => 'nullable|boolean',
            'concluida' => 'nullable|boolean',
            'vista' => 'nullable|boolean',
        ];
    }
}

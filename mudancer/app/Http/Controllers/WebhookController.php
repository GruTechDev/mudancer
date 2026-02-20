<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    /**
     * Handle WPForms webhook payload.
     * Expects JSON: {"fields":[{"value":"Name"},{"value":"email@example.com"},{"value":"5551234567"}]}
     */
    public function wpforms(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fields' => 'required|array',
            'fields.*.value' => 'nullable|string',
        ]);

        $fields = $validated['fields'];
        $nombre = $fields[0]['value'] ?? '';
        $email = $fields[1]['value'] ?? '';
        $telefono = isset($fields[2]['value']) ? preg_replace('/\D/', '', $fields[2]['value']) : '';
        $telefono = strlen($telefono) > 10 ? substr($telefono, -10) : $telefono;

        $lead = Lead::create([
            'lead_id' => 'wp-' . uniqid(),
            'nombre_cliente' => $nombre,
            'email_cliente' => $email,
            'telefono_cliente' => $telefono ?: '0000000000',
            'estado_origen' => 'Pendiente',
            'localidad_origen' => 'Pendiente',
            'colonia_origen' => 'Pendiente',
            'estado_destino' => 'Pendiente',
            'localidad_destino' => 'Pendiente',
            'colonia_destino' => 'Pendiente',
            'empaque' => 'Pendiente',
            'fecha_recoleccion' => now()->addDays(7)->toDateString(),
            'tiempo_estimado' => 'Pendiente',
            'modalidad' => 'Pendiente',
            'inventario' => 'Por definir',
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'Webhook received',
            'lead_id' => $lead->lead_id,
        ], 201);
    }
}

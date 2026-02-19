<?php

namespace App\Http\Controllers;

use App\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LeadController extends Controller
{
    private const SPANISH_MONTHS = [
        'enero' => 'January', 'febrero' => 'February', 'marzo' => 'March',
        'abril' => 'April', 'mayo' => 'May', 'junio' => 'June',
        'julio' => 'July', 'agosto' => 'August', 'septiembre' => 'September',
        'octubre' => 'October', 'noviembre' => 'November', 'diciembre' => 'December',
    ];

    /**
     * Receive WPForms webhook and create a Lead.
     * Maps WPForms webhook body keys (client_name, origin_state, etc.) to Lead model.
     */
    public function receiveFromWPForms(Request $request): JsonResponse
    {
        $request->validate([
            'client_name' => 'nullable|string',
            'client_email' => 'nullable|string',
            'client_phone' => 'nullable|string',
            'client_ideal_date' => 'nullable',
            'origin_state' => 'nullable|string',
            'origin_city' => 'nullable|string',
            'origin_floor' => 'nullable|string',
            'origin_haulage' => 'nullable|string',
            'destination_state' => 'nullable|string',
            'destination_city' => 'nullable|string',
            'destination_floor' => 'nullable|string',
            'client_invent' => 'nullable|string',
            'client_packing' => 'nullable|string',
            'client_items' => 'nullable|string',
            'client_other_item' => 'nullable|string',
            'client_service_modality' => 'nullable|string',
            'client_safe_mode' => 'nullable|string',
            'client_insurance_val' => 'nullable|numeric',
            'client_terms' => 'nullable|string',
        ]);

        \Log::info('WPForms webhook:', $request->all());

        $leadId = 'LEAD' . strtoupper(Str::random(6)) . time();

        $idealDate = $request->input('client_ideal_date');
        $dateStr = is_array($idealDate) ? ($idealDate['value'] ?? '') : (string) $idealDate;

        $telefono = preg_replace('/[^0-9]/', '', (string) $request->input('client_phone', ''));
        $telefono = strlen($telefono) > 10 ? substr($telefono, -10) : $telefono;
        $telefono = $telefono ?: '0000000000';

        $articulos = trim((string) $request->input('client_items', ''));
        $otro = trim((string) $request->input('client_other_item', ''));
        if ($otro !== '') {
            $articulos = $articulos !== '' ? $articulos . ' || ' . $otro : $otro;
        }

        $observacionesParts = array_filter([
            $request->filled('origin_haulage') ? 'Acarreo origen: ' . $request->input('origin_haulage') : null,
            $request->filled('client_safe_mode') ? 'Seguro modo: ' . $request->input('client_safe_mode') : null,
            $request->filled('client_terms') ? $request->input('client_terms') : null,
        ]);
        $observaciones = implode("\n", $observacionesParts) ?: null;

        Lead::create([
            'lead_id' => $leadId,
            'nombre_cliente' => (string) $request->input('client_name', ''),
            'email_cliente' => (string) $request->input('client_email', ''),
            'telefono_cliente' => $telefono,
            'estado_origen' => (string) $request->input('origin_state', ''),
            'localidad_origen' => (string) ($request->input('origin_city') ?? ''),
            'colonia_origen' => '',
            'piso_origen' => $this->nullIfEmpty($request->input('origin_floor')),
            'elevador_origen' => false,
            'acarreo_origen' => 30,
            'estado_destino' => (string) $request->input('destination_state', ''),
            'localidad_destino' => (string) ($request->input('destination_city') ?? ''),
            'colonia_destino' => '',
            'piso_destino' => $this->nullIfEmpty($request->input('destination_floor')),
            'elevador_destino' => false,
            'acarreo_destino' => 30,
            'empaque' => (string) $request->input('client_packing', ''),
            'fecha_recoleccion' => $this->parseSpanishDate($dateStr),
            'tiempo_estimado' => '',
            'modalidad' => (string) $request->input('client_service_modality', ''),
            'seguro' => $request->filled('client_insurance_val') ? (float) $request->input('client_insurance_val') : null,
            'inventario' => (string) $request->input('client_invent', ''),
            'articulos_delicados' => $articulos !== '' ? $articulos : null,
            'observaciones' => $observaciones,
            'publicada' => false,
            'adjudicada' => false,
            'concluida' => false,
            'vista' => false,
        ]);

        return response()->json(['success' => true, 'lead_id' => $leadId]);
    }

    private function nullIfEmpty(mixed $value): ?string
    {
        $s = trim((string) ($value ?? ''));
        return $s === '' ? null : $s;
    }

    private function parseSpanishDate(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return now()->addDays(7)->toDateString();
        }
        foreach (self::SPANISH_MONTHS as $es => $en) {
            $value = preg_replace('/\b' . $es . '\b/ui', $en, $value);
        }
        $parsed = strtotime($value);
        return $parsed ? date('Y-m-d', $parsed) : now()->addDays(7)->toDateString();
    }
}

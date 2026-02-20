<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
     * Accepts flat keys (client_name, origin_state, ...) or WPForms fields array.
     * POST /api/webhook/wpforms
     */
    public function receiveFromWPForms(Request $request): JsonResponse
    {
        Log::info('WPForms webhook received', ['payload' => $request->all()]);

        $input = $request->all();

        // WPForms sometimes sends { "fields": [ {"id": 1, "value": "..."}, ... ] }
        if (isset($input['fields']) && is_array($input['fields'])) {
            $input = $this->mapFieldsArrayToFlat($input['fields'], $input);
        }

        $request->merge($input);

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

        try {
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
        } catch (\Throwable $e) {
            Log::error('WPForms webhook Lead::create failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }

        Log::info('WPForms webhook lead created', ['lead_id' => $leadId]);
        return response()->json(['success' => true, 'lead_id' => $leadId]);
    }

    /**
     * Map WPForms "fields" array to flat keys we expect.
     * WPForms may send fields by id/label; map by position or by name when present.
     */
    private function mapFieldsArrayToFlat(array $fields, array $existing): array
    {
        $flat = $existing;
        $byIndex = [
            'client_name', 'client_email', 'client_phone', 'client_ideal_date',
            'origin_state', 'origin_city', 'origin_floor', 'origin_haulage',
            'destination_state', 'destination_city', 'destination_floor', 'destination_haulage',
            'client_packing', 'client_items', 'client_other_item', 'client_invent',
            'client_service_modality', 'client_safe_mode', 'client_insurance_val', 'client_terms',
        ];
        foreach ($fields as $i => $field) {
            $value = is_array($field) ? ($field['value'] ?? $field['values'][0] ?? '') : (string) $field;
            if (isset($field['name']) && is_string($field['name'])) {
                $flat[$field['name']] = $value;
            } elseif (isset($field['key']) && is_string($field['key'])) {
                $flat[$field['key']] = $value;
            } elseif (isset($byIndex[$i])) {
                $flat[$byIndex[$i]] = $value;
            }
        }
        return $flat;
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

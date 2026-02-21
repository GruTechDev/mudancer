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
     * POST /api/webhook/wpforms
     */
    public function receiveFromWPForms(Request $request): JsonResponse
    {
        Log::info('WPForms webhook received', ['payload' => $request->all()]);

        $input = $request->all();

        // WPForms may send { "fields": [...] } array format
        if (isset($input['fields']) && is_array($input['fields'])) {
            $input = $this->mapFieldsArrayToFlat($input['fields'], $input);
            $request->merge($input);
        }

        // ── Validate required fields ─────────────────────────────────────────
        $request->validate([
            'client_phone' => ['required', 'regex:/^[0-9\s\-\+\(\)]{7,20}$/'],
        ], [
            'client_phone.required' => 'Client phone is required.',
            'client_phone.regex'    => 'Client phone must be a valid phone number.',
        ]);

        // ── Duplicate check by normalised phone number ────────────────────────
        $phoneRaw  = preg_replace('/[^0-9]/', '', (string) $request->input('client_phone', ''));
        $phoneFull = strlen($phoneRaw) > 10 ? substr($phoneRaw, -10) : $phoneRaw;
        $phoneNorm = str_pad($phoneFull ?: '0000000000', 10, '0');

        if (Lead::where('telefono_cliente', $phoneNorm)->exists()) {
            Log::warning('Duplicate lead rejected', ['phone' => $phoneNorm]);
            return response()->json([
                'success' => false,
                'error'   => 'duplicate',
                'message' => 'A lead with this phone number already exists.',
            ], 409);
        }

        $request->validate([
            'client_name'        => 'required|string|max:255',
            'client_email'       => 'required|email',
            'client_ideal_date'  => 'required',
            'origin_state'       => 'required|string|max:255',
            'origin_city'        => 'required|string|max:255',
            'destination_state'  => 'required|string|max:255',
            'destination_city'   => 'required|string|max:255',
            'client_invent'      => 'required|string',
        ], [
            'client_name.required'       => 'Client name is required.',
            'client_email.required'      => 'Client email is required.',
            'client_email.email'         => 'Client email must be a valid email address.',
            'client_ideal_date.required' => 'Ideal date is required.',
            'origin_state.required'      => 'Origin state is required.',
            'origin_city.required'       => 'Origin city is required.',
            'destination_state.required' => 'Destination state is required.',
            'destination_city.required'  => 'Destination city is required.',
            'client_invent.required'     => 'Inventory is required.',
        ]);

        // ── Generate unique 11-char alphanumeric lead ID ──────────────────────
        do {
            $leadId = strtoupper(Str::random(11));
        } while (Lead::where('lead_id', $leadId)->exists());

        // ── Parse & normalise fields ──────────────────────────────────────────
        $idealDate = $request->input('client_ideal_date');
        $dateStr   = is_array($idealDate) ? ($idealDate['value'] ?? '') : (string) $idealDate;

        // $phoneNorm was already computed during duplicate check
        $telefono = $phoneNorm;

        // Merge items fields
        $articulos = trim((string) $request->input('client_items', ''));
        $otro      = trim((string) $request->input('client_other_item', ''));
        if ($otro !== '') {
            $articulos = $articulos !== '' ? $articulos . ' || ' . $otro : $otro;
        }

        // Build observaciones from optional fields
        $obsParts = array_filter([
            $request->filled('origin_haulage')    ? 'Origin haulage: '   . $request->input('origin_haulage')    : null,
            $request->filled('destination_haulage')? 'Dest. haulage: '   . $request->input('destination_haulage') : null,
            $request->filled('client_safe_mode')  ? 'Insurance mode: '  . $request->input('client_safe_mode')  : null,
            $request->filled('client_packing')    ? 'Packing: '         . $request->input('client_packing')    : null,
        ]);
        $observaciones = implode("\n", $obsParts) ?: null;

        try {
            Lead::create([
                'lead_id'            => $leadId,
                'nombre_cliente'     => $request->input('client_name'),
                'email_cliente'      => $request->input('client_email'),
                'telefono_cliente'   => $telefono,
                'estado_origen'      => $request->input('origin_state'),
                'localidad_origen'   => $request->input('origin_city'),
                'colonia_origen'     => '',
                'piso_origen'        => $this->nullIfEmpty($request->input('origin_floor')),
                'elevador_origen'    => $this->parseBool($request->input('origin_elevator')),
                'acarreo_origen'     => $this->parseMeters($request->input('origin_haulage')),
                'estado_destino'     => $request->input('destination_state'),
                'localidad_destino'  => $request->input('destination_city'),
                'colonia_destino'    => '',
                'piso_destino'       => $this->nullIfEmpty($request->input('destination_floor')),
                'elevador_destino'   => $this->parseBool($request->input('destination_elevator')),
                'acarreo_destino'    => $this->parseMeters($request->input('destination_haulage')),
                'empaque'            => (string) $request->input('client_packing', ''),
                'fecha_recoleccion'  => $this->parseSpanishDate($dateStr),
                'tiempo_estimado'    => '',
                'modalidad'          => (string) $request->input('client_service_modality', ''),
                'seguro'             => $request->filled('client_insurance_val') ? (float) $request->input('client_insurance_val') : null,
                'inventario'         => $request->input('client_invent'),
                'articulos_delicados'=> $articulos !== '' ? $articulos : null,
                'observaciones'      => $observaciones,
                'publicada'          => false,
                'adjudicada'         => false,
                'concluida'          => false,
                'vista'              => false,
            ]);
        } catch (\Throwable $e) {
            Log::error('Webhook Lead::create failed', ['error' => $e->getMessage()]);
            throw $e;
        }

        Log::info('Webhook lead created', ['lead_id' => $leadId]);

        return response()->json(['success' => true, 'lead_id' => $leadId]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function mapFieldsArrayToFlat(array $fields, array $existing): array
    {
        $flat    = $existing;
        $byIndex = [
            'client_name', 'client_email', 'client_phone', 'client_ideal_date',
            'origin_state', 'origin_city', 'origin_floor', 'origin_elevator',
            'origin_haulage', 'destination_state', 'destination_city',
            'destination_floor', 'destination_elevator', 'destination_haulage',
            'client_invent', 'client_packing', 'client_items', 'client_other_item',
            'client_service_modality', 'client_safe_mode', 'client_insurance_val',
        ];
        foreach ($fields as $i => $field) {
            $value = is_array($field) ? ($field['value'] ?? $field['values'][0] ?? '') : (string) $field;
            if (isset($field['name']) && is_string($field['name']))       $flat[$field['name']] = $value;
            elseif (isset($field['key']) && is_string($field['key']))     $flat[$field['key']]  = $value;
            elseif (isset($byIndex[$i]))                                   $flat[$byIndex[$i]]   = $value;
        }
        return $flat;
    }

    private function nullIfEmpty(mixed $value): ?string
    {
        $s = trim((string) ($value ?? ''));
        return $s === '' ? null : $s;
    }

    private function parseBool(mixed $value): bool
    {
        if (is_bool($value)) return $value;
        return in_array(strtolower((string) ($value ?? '')), ['1', 'true', 'yes', 'sí', 'si'], true);
    }

    private function parseMeters(mixed $value): int
    {
        $n = (int) preg_replace('/[^0-9]/', '', (string) ($value ?? ''));
        return $n > 0 ? $n : 30;
    }

    private function parseSpanishDate(string $value): string
    {
        $value = trim($value);
        if ($value === '') return now()->addDays(7)->toDateString();
        foreach (self::SPANISH_MONTHS as $es => $en) {
            $value = preg_replace('/\b' . $es . '\b/ui', $en, $value);
        }
        $parsed = strtotime($value);
        return $parsed ? date('Y-m-d', $parsed) : now()->addDays(7)->toDateString();
    }
}

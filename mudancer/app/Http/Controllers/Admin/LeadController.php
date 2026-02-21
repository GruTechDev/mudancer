<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateLeadRequest;
use App\Models\Lead;
use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class LeadController extends Controller
{
    /**
     * GET /api/admin/leads — unpublished leads only (New Leads page).
     */
    public function index(): JsonResponse
    {
        $leads = Lead::withCount('quotes')
            ->where('publicada', false)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Lead $lead) => $this->leadTableRow($lead));

        return response()->json(['data' => $leads]);
    }

    /**
     * GET /api/admin/leads/{id} — full lead details with quotes and provider.
     */
    public function show(int $id): JsonResponse
    {
        $lead = Lead::with('quotes.provider')->findOrFail($id);

        return response()->json([
            'data' => $this->leadWithComputed($lead),
        ]);
    }

    /**
     * PUT /api/admin/leads/{id} — update lead fields (excluding lead_id).
     */
    public function update(UpdateLeadRequest $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $lead->update($request->validated());
        $lead->vista = true;
        $lead->save();

        return response()->json([
            'data' => $this->leadWithComputed($lead->fresh()),
        ]);
    }

    /**
     * POST /api/admin/leads/{id}/publish — generate unique public_token, mark publicada.
     */
    public function publish(int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);

        if (! $lead->publicada) {
            do {
                $token = Str::random(16);
            } while (Lead::where('public_token', $token)->exists());

            $lead->public_token = $token;
            $lead->publicada    = true;
            $lead->vista        = true;
            $lead->save();
        }

        $url = $this->buildPublicUrl($lead);

        return response()->json([
            'data' => $this->leadWithComputed($lead->fresh()),
            'url'  => $url,
        ]);
    }

    /**
     * POST /api/admin/leads/{id}/adjudicar
     */
    public function adjudicar(int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $lead->adjudicada = true;
        $lead->vista      = true;
        $lead->save();

        return response()->json([
            'data' => $this->leadWithComputed($lead->fresh()),
        ]);
    }

    /**
     * POST /api/admin/leads/{id}/concluir
     */
    public function concluir(int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $lead->concluida = true;
        $lead->vista     = true;
        $lead->save();

        return response()->json([
            'data' => $this->leadWithComputed($lead->fresh()),
        ]);
    }

    /**
     * GET /api/admin/cotizadas — published, not-adjudicated leads with their quotes (Quotes page).
     */
    public function quotedLeads(): JsonResponse
    {
        $leads = Lead::query()
            ->where('publicada', true)
            ->where('adjudicada', false)
            ->where('concluida', false)
            ->withCount(['quotes as new_quotes' => fn ($q) => $q->where('vista', false)])
            ->withCount('quotes')
            ->with(['quotes.provider'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Lead $lead) => $this->leadTableRow($lead, true));

        return response()->json(['data' => $leads]);
    }

    /**
     * GET /api/admin/ordenes — adjudicated leads with their selected quote and provider (Orders page).
     */
    public function ordenes(): JsonResponse
    {
        $leads = Lead::query()
            ->where('adjudicada', true)
            ->with([
                'quotes' => fn ($q) => $q->where('seleccionada', true)->with('provider'),
            ])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(fn (Lead $lead) => [
                'id'               => $lead->id,
                'public_id'        => $lead->lead_id,
                'client_name'      => $lead->nombre_cliente,
                'email_cliente'    => $lead->email_cliente,
                'telefono_cliente' => $lead->telefono_cliente,
                'origin_state'     => $lead->estado_origen,
                'origin_city'      => $lead->localidad_origen,
                'destination_state' => $lead->estado_destino,
                'destination_city'  => $lead->localidad_destino,
                'ideal_date'       => $lead->fecha_recoleccion,
                'created_at'       => $lead->created_at?->toIso8601String(),
                'is_new'           => ! $lead->vista,
                'concluida'        => $lead->concluida,
                'public_url'       => $this->buildPublicUrl($lead),
                'assigned_quote'   => $lead->quotes->first() ? $this->formatQuote($lead->quotes->first()) : null,
            ]);

        return response()->json(['data' => $leads]);
    }

    /**
     * POST /api/admin/quotes/{quote}/asignar — assign quote, mark lead as adjudicated.
     * Returns the updated lead (now moves to Orders page) and the assigned quote.
     */
    public function assignQuote(Quote $quote): JsonResponse
    {
        // Unselect any previously selected quote for this lead
        Quote::where('lead_id', $quote->lead_id)
            ->where('seleccionada', true)
            ->update(['seleccionada' => false]);

        $quote->update(['seleccionada' => true, 'vista' => true]);
        $quote->lead->update(['adjudicada' => true, 'vista' => true]);

        $quote->load(['lead.quotes.provider', 'provider']);

        return response()->json([
            'data' => [
                'lead'           => $this->leadTableRow($quote->lead->fresh(['quotes.provider']), true),
                'assigned_quote' => $this->formatQuote($quote),
            ],
        ]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function buildPublicUrl(Lead $lead): ?string
    {
        if (! $lead->publicada || ! $lead->public_token) {
            return null;
        }
        $base = rtrim(env('FRONTEND_URL', 'https://mudancer.com'), '/');
        return "{$base}/leads/{$lead->lead_id}/{$lead->public_token}";
    }

    private function formatQuote(Quote $quote): array
    {
        return [
            'id'                 => $quote->id,
            'precio_total'       => $quote->precio_total,
            'apartado'           => $quote->apartado,
            'anticipo'           => $quote->anticipo,
            'pago_final'         => $quote->pago_final,
            'tarifa_seguro'      => $quote->tarifa_seguro,
            'notas'              => $quote->notas,
            'seleccionada'       => $quote->seleccionada,
            'cliente_interesada' => $quote->cliente_interesada,
            'vista'              => $quote->vista,
            'created_at'         => $quote->created_at?->toIso8601String(),
            'provider'           => $quote->provider ? [
                'id'          => $quote->provider->id,
                'nombre'      => $quote->provider->nombre,
                'logo'        => $quote->provider->logo,
                'reputacion'  => $quote->provider->reputacion,
                'telefono'    => $quote->provider->telefono,
                'email'       => $quote->provider->email,
                'responsable' => $quote->provider->responsable,
                'domicilio'   => $quote->provider->domicilio,
            ] : null,
        ];
    }

    private function leadTableRow(Lead $lead, bool $includeQuotes = false): array
    {
        $row = [
            'id'                => $lead->id,
            'public_id'         => $lead->lead_id,
            'client_name'       => $lead->nombre_cliente,
            'origin_state'      => $lead->estado_origen,
            'origin_city'       => $lead->localidad_origen,
            'destination_state' => $lead->estado_destino,
            'destination_city'  => $lead->localidad_destino,
            'ideal_date'        => $lead->fecha_recoleccion,
            'status'            => $this->deriveStatus($lead),
            'created_at'        => $lead->created_at?->toIso8601String(),
            'is_new'            => ! $lead->vista,
            'is_new_for_admin'  => ! $lead->vista,
            'quotes_count'      => $lead->quotes_count ?? 0,
            'new_quotes'        => $lead->new_quotes ?? 0,
            'public_url'        => $this->buildPublicUrl($lead),
        ];

        if ($includeQuotes) {
            $row['quotes'] = $lead->quotes
                ? $lead->quotes->map(fn (Quote $q) => $this->formatQuote($q))->values()->all()
                : [];
        }

        return $row;
    }

    private function leadWithComputed(Lead $lead): array
    {
        $attrs               = $lead->toArray();
        $attrs['public_id']  = $lead->lead_id;
        $attrs['client_name'] = $lead->nombre_cliente;
        $attrs['ideal_date'] = $lead->fecha_recoleccion;
        $attrs['status']     = $this->deriveStatus($lead);
        $attrs['is_new']     = ! $lead->vista;
        $attrs['is_new_for_admin'] = ! $lead->vista;
        $attrs['public_url'] = $this->buildPublicUrl($lead);

        return $attrs;
    }

    private function deriveStatus(Lead $lead): string
    {
        if ($lead->concluida)  return 'concluded';
        if ($lead->adjudicada) return 'adjudicated';
        if ($lead->publicada)  return 'published';
        return 'draft';
    }
}

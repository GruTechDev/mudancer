<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateLeadRequest;
use App\Lead;
use Illuminate\Http\JsonResponse;

class LeadController extends Controller
{
    /**
     * List all leads, newest first, with quotes count and is_new for React highlighting.
     * GET /api/admin/leads
     */
    public function index(): JsonResponse
    {
        $leads = Lead::withCount('quotes')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Lead $lead) => $this->leadTableRow($lead));

        return response()->json(['data' => $leads]);
    }

    /**
     * Show full lead details with quotes and provider.
     * GET /api/admin/leads/{id}
     */
    public function show(int $id): JsonResponse
    {
        $lead = Lead::with('quotes.provider')->findOrFail($id);

        return response()->json([
            'data' => $this->leadWithComputed($lead),
        ]);
    }

    /**
     * Update lead (all fields except lead_id), then mark as viewed.
     * PUT /api/admin/leads/{id}
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
     * Publish lead: set publicada and vista, return unique public URL.
     * POST /api/admin/leads/{id}/publish
     */
    public function publish(int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $lead->publicada = true;
        $lead->vista = true;
        $lead->save();

        $url = '/leads/' . $lead->lead_id;

        return response()->json([
            'data' => $this->leadWithComputed($lead->fresh()),
            'url' => $url,
        ]);
    }

    /**
     * Mark lead as adjudicated.
     * POST /api/admin/leads/{id}/adjudicar
     */
    public function adjudicar(int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $lead->adjudicada = true;
        $lead->vista = true;
        $lead->save();

        return response()->json([
            'data' => $this->leadWithComputed($lead->fresh()),
        ]);
    }

    /**
     * Mark lead as concluded.
     * POST /api/admin/leads/{id}/concluir
     */
    public function concluir(int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $lead->concluida = true;
        $lead->vista = true;
        $lead->save();

        return response()->json([
            'data' => $this->leadWithComputed($lead->fresh()),
        ]);
    }

    private function leadTableRow(Lead $lead): array
    {
        return [
            'id' => $lead->id,
            'public_id' => $lead->lead_id,
            'client_name' => $lead->nombre_cliente,
            'origin_state' => $lead->estado_origen,
            'origin_city' => $lead->localidad_origen,
            'destination_state' => $lead->estado_destino,
            'destination_city' => $lead->localidad_destino,
            'ideal_date' => $lead->fecha_recoleccion,
            'status' => $this->deriveStatus($lead),
            'created_at' => $lead->created_at?->toIso8601String(),
            'is_new_for_admin' => ! $lead->vista,
            'is_new' => ! $lead->vista,
            'quotes_count' => $lead->quotes_count ?? 0,
        ];
    }

    private function leadWithComputed(Lead $lead): array
    {
        $attrs = $lead->toArray();
        $attrs['public_id'] = $lead->lead_id;
        $attrs['client_name'] = $lead->nombre_cliente;
        $attrs['ideal_date'] = $lead->fecha_recoleccion;
        $attrs['status'] = $this->deriveStatus($lead);
        $attrs['is_new_for_admin'] = ! $lead->vista;
        $attrs['is_new'] = ! $lead->vista;

        return $attrs;
    }

    private function deriveStatus(Lead $lead): string
    {
        if ($lead->concluida) {
            return 'concluded';
        }
        if ($lead->adjudicada) {
            return 'adjudicated';
        }
        if ($lead->publicada) {
            return 'published';
        }

        return 'draft';
    }
}

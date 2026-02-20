<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Provider;
use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProveedorController extends Controller
{
    /**
     * GET /api/proveedor/leads — available leads: publicada=true, adjudicada=false, newest first.
     */
    public function availableLeads(): JsonResponse
    {
        $leads = Lead::query()
            ->where('publicada', true)
            ->where('adjudicada', false)
            ->orderBy('created_at', 'desc')
            ->select([
                'id',
                'lead_id',
                'nombre_cliente',
                'estado_origen',
                'localidad_origen',
                'estado_destino',
                'fecha_recoleccion',
            ])
            ->withCount('quotes')
            ->get();

        return response()->json(['data' => $leads]);
    }

    /**
     * GET /api/proveedor/leads/{lead} — full lead + current provider's quotes count for this lead.
     */
    public function showLead(Lead $lead): JsonResponse
    {
        $provider = $this->getProviderForUser();
        if (! $provider) {
            return response()->json(['message' => 'Provider profile not found.'], 403);
        }

        $lead->loadCount(['quotes as my_quotes_count' => function ($q) use ($provider) {
            $q->where('provider_id', $provider->id);
        }]);

        return response()->json(['data' => $lead]);
    }

    /**
     * POST /api/proveedor/leads/{lead}/cotizar — submit quote.
     * apartado = precio_total * 0.2, anticipo = 0.4, pago_final = 0.4
     */
    public function submitQuote(Request $request, Lead $lead): JsonResponse
    {
        $validated = $request->validate([
            'precio_total' => 'required|numeric|min:0',
            'notas' => 'nullable|string',
        ]);

        $provider = $this->getProviderForUser();
        if (! $provider) {
            return response()->json(['message' => 'Provider profile not found.'], 403);
        }

        $precio = (float) $validated['precio_total'];
        $quote = Quote::create([
            'lead_id' => $lead->id,
            'provider_id' => $provider->id,
            'precio_total' => $precio,
            'apartado' => round($precio * 0.2, 2),
            'anticipo' => round($precio * 0.4, 2),
            'pago_final' => round($precio * 0.4, 2),
            'notas' => $validated['notas'] ?? null,
        ]);

        return response()->json(['data' => $quote], 201);
    }

    /**
     * GET /api/proveedor/ordenes — quotes where lead.adjudicada=true and provider_id=current provider.
     */
    public function myOrders(): JsonResponse
    {
        $provider = $this->getProviderForUser();
        if (! $provider) {
            return response()->json(['message' => 'Provider profile not found.'], 403);
        }

        $quotes = Quote::query()
            ->where('provider_id', $provider->id)
            ->whereHas('lead', fn ($q) => $q->where('adjudicada', true))
            ->with('lead')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $quotes]);
    }

    /**
     * POST /api/proveedor/ordenes/{quote}/concluir — log and return success.
     */
    public function conclude(Quote $quote): JsonResponse
    {
        $provider = $this->getProviderForUser();
        if (! $provider) {
            return response()->json(['message' => 'Provider profile not found.'], 403);
        }
        if ((int) $quote->provider_id !== (int) $provider->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        \Log::info('Provider concluded service', [
            'quote_id' => $quote->id,
            'lead_id' => $quote->lead_id,
            'provider_id' => $provider->id,
        ]);

        return response()->json(['message' => 'Success']);
    }

    /**
     * Get Provider record for the authenticated user (match by email).
     */
    private function getProviderForUser(): ?Provider
    {
        $user = auth()->user();
        if (! $user) {
            return null;
        }

        return Provider::where('email', $user->email)->first();
    }
}

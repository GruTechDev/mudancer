<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    /**
     * POST /api/cliente/login — stateless: find lead by phone, return lead + quotes.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'telefono' => 'required|string|size:10|regex:/^[0-9]+$/',
        ]);

        $lead = Lead::where('telefono_cliente', $request->telefono)
            ->with('quotes.provider')
            ->firstOrFail();

        return response()->json([
            'lead' => $lead,
            'quotes' => $lead->quotes,
        ]);
    }

    /**
     * PUT /api/cliente/quotes/{quote}/seleccionar — set quote as selected and lead as adjudicated.
     */
    public function seleccionar(Quote $quote): JsonResponse
    {
        $quote->update(['seleccionada' => true]);
        $quote->lead->update(['adjudicada' => true]);

        return response()->json(['message' => 'Success']);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderController extends Controller
{
    /**
     * GET /api/admin/providers
     */
    public function index(): JsonResponse
    {
        $providers = Provider::query()->orderByDesc('created_at')->get();
        return response()->json($providers);
    }

    /**
     * GET /api/admin/providers/{id}
     */
    public function show(Provider $provider): JsonResponse
    {
        return response()->json($provider);
    }

    /**
     * POST /api/admin/providers
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'rfc' => 'required|string|max:255',
            'domicilio' => 'required|string',
            'telefono' => 'required|string|max:50',
            'email' => 'required|email|unique:providers,email',
            'responsable' => 'required|string|max:255',
            'logo' => 'nullable|string|max:255',
            'reputacion' => 'nullable|numeric|min:0',
        ]);
        $provider = Provider::create($validated);
        return response()->json($provider, 201);
    }

    /**
     * PUT /api/admin/providers/{id}
     */
    public function update(Request $request, Provider $provider): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'rfc' => 'sometimes|string|max:255',
            'domicilio' => 'sometimes|string',
            'telefono' => 'sometimes|string|max:50',
            'email' => 'sometimes|email|unique:providers,email,' . $provider->id,
            'responsable' => 'sometimes|string|max:255',
            'logo' => 'nullable|string|max:255',
            'reputacion' => 'nullable|numeric|min:0',
        ]);
        $provider->update($validated);
        return response()->json($provider->fresh());
    }

    /**
     * DELETE /api/admin/providers/{id}
     */
    public function destroy(Provider $provider): JsonResponse
    {
        $provider->delete();
        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProviderController extends Controller
{
    /** Reusable base query: eager-loads completed_count on every response. */
    private function baseQuery()
    {
        return Provider::withCount([
            'quotes as completed_count' => fn ($q) =>
                $q->whereHas('lead', fn ($l) => $l->where('concluida', true)),
        ]);
    }

    /**
     * GET /api/admin/providers
     * Query params: search, search_by (nombre|telefono), page, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = $this->baseQuery()->orderByDesc('created_at');

        if ($search = trim($request->input('search', ''))) {
            $by = $request->input('search_by', 'nombre');
            if ($by === 'telefono') {
                $query->where('telefono', 'like', "%{$search}%");
            } else {
                $query->where('nombre', 'like', "%{$search}%");
            }
        }

        $perPage = max(1, min(50, (int) $request->input('per_page', 10)));

        return response()->json($query->paginate($perPage));
    }

    /**
     * GET /api/admin/providers/{id}
     */
    public function show(Provider $provider): JsonResponse
    {
        return response()->json(
            $this->baseQuery()->findOrFail($provider->id)
        );
    }

    /**
     * POST /api/admin/providers
     * Also creates a User account (role=provider) linked to the provider.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nombre'      => 'required|string|max:255|unique:providers,nombre',
            'rfc'         => 'required|string|max:255',
            'domicilio'   => 'required|string',
            'telefono'    => ['required', 'string', 'regex:/^[0-9]{10}$/'],
            'email'       => 'required|email|unique:providers,email|unique:users,email',
            'responsable' => 'required|string|max:255',
            'logo'        => 'nullable|string|max:500',
            'reputacion'  => 'nullable|numeric|min:0|max:5',
            'password'    => 'required|string|min:6',
        ], [
            'nombre.unique'   => 'A company with this name already exists.',
            'telefono.regex'  => 'Phone must be exactly 10 digits (0-9 only).',
            'email.unique'    => 'This email is already registered.',
            'password.min'    => 'Password must be at least 6 characters.',
        ]);

        $provider = DB::transaction(function () use ($request) {
            $user = User::create([
                'name'     => $request->input('responsable'),
                'email'    => $request->input('email'),
                'phone'    => $request->input('telefono'),
                'password' => $request->input('password'),
                'role'     => 'provider',
            ]);

            return Provider::create([
                'user_id'     => $user->id,
                'nombre'      => $request->input('nombre'),
                'rfc'         => $request->input('rfc'),
                'domicilio'   => $request->input('domicilio'),
                'telefono'    => $request->input('telefono'),
                'email'       => $request->input('email'),
                'responsable' => $request->input('responsable'),
                'logo'        => $request->input('logo'),
                'reputacion'  => $request->input('reputacion', 0),
            ]);
        });

        return response()->json(
            $this->baseQuery()->findOrFail($provider->id), 201
        );
    }

    /**
     * PUT /api/admin/providers/{id}
     */
    public function update(Request $request, Provider $provider): JsonResponse
    {
        $validated = $request->validate([
            'nombre'      => 'sometimes|string|max:255',
            'rfc'         => 'sometimes|string|max:255',
            'domicilio'   => 'sometimes|string',
            'telefono'    => ['sometimes', 'string', 'regex:/^[0-9]{10}$/'],
            'email'       => 'sometimes|email|unique:providers,email,' . $provider->id,
            'responsable' => 'sometimes|string|max:255',
            'logo'        => 'nullable|string|max:500',
            'reputacion'  => 'nullable|numeric|min:0|max:5',
        ]);

        $provider->update($validated);

        return response()->json(
            $this->baseQuery()->findOrFail($provider->id)
        );
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

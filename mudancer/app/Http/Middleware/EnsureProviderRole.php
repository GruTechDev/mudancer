<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProviderRole
{
    /**
     * Ensure authenticated user has role=provider (use after auth:sanctum).
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role !== 'provider') {
            return response()->json(['message' => 'Unauthorized for provider access.'], 403);
        }

        return $next($request);
    }
}

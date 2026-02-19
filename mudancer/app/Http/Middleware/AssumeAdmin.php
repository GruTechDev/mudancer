<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AssumeAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // Stub: add assume-admin logic when needed
        return $next($request);
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('providers')->cascadeOnDelete();
            $table->decimal('precio_total', 12, 2);
            $table->decimal('apartado', 12, 2);
            $table->decimal('anticipo', 12, 2);
            $table->decimal('pago_final', 12, 2);
            $table->decimal('tarifa_seguro', 12, 2)->nullable();
            $table->text('notas')->nullable();
            $table->boolean('seleccionada')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};

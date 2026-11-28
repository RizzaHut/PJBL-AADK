SET local check_function_bodies = off;

ALTER TYPE "public"."status_transaksi" ADD VALUE 'cancelled' AFTER 'completed';


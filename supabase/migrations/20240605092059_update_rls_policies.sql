drop policy "Enable read access for all users" on "public"."allow_list_data";

drop policy "Enable read access for all users" on "public"."attestations";

drop policy "Enable read access for all users" on "public"."claims";

drop policy "Enable read access for all users" on "public"."contract_events";

drop policy "Enable read access for all users" on "public"."contracts";

drop policy "Enable read access for all users" on "public"."events";

drop policy "Enable read access for all users" on "public"."fractions";

drop policy "Enable read access for all users" on "public"."hypercert_allow_list_records";

drop policy "Enable read access for all users" on "public"."hypercert_allow_lists";

drop policy "Enable read access for all users" on "public"."metadata";

drop policy "Enable read access for all users" on "public"."supported_schemas";

create policy "Enable read access for all users"
on "public"."allow_list_data"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."attestations"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."claims"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."contract_events"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."contracts"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."events"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."fractions"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."hypercert_allow_list_records"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."hypercert_allow_lists"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."metadata"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."supported_schemas"
as permissive
for select
to public
using (true);





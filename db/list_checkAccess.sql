-- Check that the user has access to the List
select lr.access_level
from users u inner join user_roles ur
    on u.id = ur.user_id
  inner join list_roles lr
    on lr.role_id = ur.role_id
  inner join list
    on list.id = lr.list_id
where u.username = $1
and list.name = $2

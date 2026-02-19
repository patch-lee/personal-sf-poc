public class QueryContact {
  public static Id getContactID(String lastName, String title) {
    try {
      Contact myContact = Database.query(
        'SELECT ID FROM Contact WHERE lastName = :lastName AND title = :title LIMIT 1'
      );
      return myContact.Id;
    } catch (Exception ex) {
      return null;
    }
  }
  public static Id getContactIDWithBinds(Map<String, Object> bindVars) {
    //do not modify any code above this line
    //implement the logic that will use bindVars to retrieve the contact's ID
    String query = 'SELECT ID FROM Contact WHERE lastName = :lastName AND title = :title LIMIT 1';
    List<Contact> cons = Database.queryWithBinds(
      query,
      bindVars,
      AccessLevel.SYSTEM_MODE
    );

    if (!cons.isEmpty()) {
      return cons[0].Id;
    }
    return null;
  }
}

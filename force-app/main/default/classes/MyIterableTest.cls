@isTest
public class MyIterableTest {
  @IsTest
  public static void testIterableForLoop() {
    List<String> strings = new List<String>{ 'Hello', 'World' };

    MyIterable myIter = new MyIterable(strings);
    for (String str : myIter) {
      System.debug(str);
    }
  }
}
